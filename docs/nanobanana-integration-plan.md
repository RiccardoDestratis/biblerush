# NanoBanana API Integration Plan

## Overview

This document outlines the technical integration plan for using NanoBanana API (free tier) to generate images for quiz questions in the admin dashboard.

## API Information

### Base URL
```
https://api.nanobananai.com
```

### Endpoint
```
POST /v1beta/models/gemini-2.5-flash-image:generateContent
```

### Authentication
- API key passed as query parameter: `?key=YOUR_API_KEY`
- Or in Authorization header: `Bearer YOUR_API_KEY`
- Store in environment variable: `NANOBANANA_API_KEY`

### Compatibility
NanoBanana API is **fully compatible with Google's Gemini API interface**. All request/response formats match the official Gemini API.

---

## Request Format

### Endpoint URL
```
POST https://api.nanobananai.com/v1beta/models/gemini-2.5-flash-image:generateContent?key={API_KEY}
```

### Request Headers
```typescript
{
  'Content-Type': 'application/json',
  // Optional: Authorization header alternative
  // 'Authorization': `Bearer ${API_KEY}`
}
```

### Request Body Structure

```typescript
{
  contents: [
    {
      parts: [
        // For text-to-image generation (no input image):
        {
          text: "Your prompt here"
        },
        // For image editing (with input image):
        // {
        //   inline_data: {
        //     mime_type: "image/png",
        //     data: "base64_encoded_image_data"
        //   }
        // },
        // {
        //   text: "Edit instruction here"
        // }
      ]
    }
  ],
  generationConfig: {
    responseModalities: ["IMAGE"],
    imageConfig: {
      aspectRatio: "16:9" // Options: "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "5:4", "4:5", "21:9"
    }
  }
}
```

### Example Request (cURL)

```bash
curl -X POST \
  'https://api.nanobananai.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Biblical scene showing the birth of Jesus in a stable in Bethlehem. Warm lighting, reverent tone, suitable for all ages. No text, no modern elements."
      }]
    }],
    "generationConfig": {
      "responseModalities": ["IMAGE"],
      "imageConfig": {
        "aspectRatio": "16:9"
      }
    }
  }'
```

---

## Response Format

### Success Response

```typescript
{
  candidates: [
    {
      content: {
        parts: [
          {
            inline_data: {
              mime_type: "image/png", // or "image/jpeg"
              data: "base64_encoded_image_data"
            }
          }
        ]
      },
      finishReason: "STOP"
    }
  ]
}
```

### Error Response

```typescript
{
  error: {
    code: 400,
    message: "Error description",
    status: "INVALID_ARGUMENT"
  }
}
```

---

## Implementation Strategy

### 1. API Utility Function

Create `/lib/utils/nanobanana.ts`:

```typescript
interface GenerateImageOptions {
  prompt: string;
  style?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '3:2' | '2:3' | '5:4' | '4:5' | '21:9';
}

interface GenerateImageResponse {
  success: boolean;
  imageData?: string; // base64 encoded
  mimeType?: string;
  error?: string;
}

export async function generateImageWithNanoBanana(
  options: GenerateImageOptions
): Promise<GenerateImageResponse> {
  const apiKey = process.env.NANOBANANA_API_KEY;
  
  if (!apiKey) {
    return {
      success: false,
      error: 'NANOBANANA_API_KEY not configured'
    };
  }

  // Combine prompt and style if style provided
  const fullPrompt = options.style 
    ? `${options.prompt}\n\nStyle: ${options.style}`
    : options.prompt;

  const endpoint = `https://api.nanobananai.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ['IMAGE'],
          imageConfig: {
            aspectRatio: options.aspectRatio || '16:9'
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error?.message || `API request failed: ${response.statusText}`
      };
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.inline_data) {
      return {
        success: false,
        error: 'Invalid response format from API'
      };
    }

    const imageData = data.candidates[0].content.parts[0].inline_data.data;
    const mimeType = data.candidates[0].content.parts[0].inline_data.mime_type;

    return {
      success: true,
      imageData,
      mimeType
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
```

### 2. Server Action for Image Generation

Create `/app/api/admin/generate-image/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateImageWithNanoBanana } from '@/lib/utils/nanobanana';
import { createClient } from '@/lib/supabase/server';
import sharp from 'sharp'; // For image optimization

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin, tier')
      .eq('id', user.id)
      .single();

    if (!userData?.is_admin && userData?.tier !== 'church') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { prompt, style, aspectRatio, questionId } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Generate image
    const result = await generateImageWithNanoBanana({
      prompt,
      style,
      aspectRatio: aspectRatio || '16:9'
    });

    if (!result.success || !result.imageData) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate image' },
        { status: 500 }
      );
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(result.imageData, 'base64');

    // Optimize image (compress to <300KB, convert to WebP)
    const optimizedBuffer = await sharp(imageBuffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    // Upload to Supabase Storage
    const fileName = `${questionId || Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
    const filePath = `question-images/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('question-images')
      .upload(filePath, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('question-images')
      .getPublicUrl(filePath);

    // Update question record if questionId provided
    if (questionId) {
      await supabase
        .from('questions')
        .update({
          image_location: publicUrl,
          image_prompt: prompt,
          image_style: style || null,
          image_aspect_ratio: aspectRatio || '16:9',
          is_custom_image: false
        })
        .eq('id', questionId);
    }

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      fileName
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3. Image Optimization Utility

Create `/lib/utils/image-optimization.ts`:

```typescript
import sharp from 'sharp';

interface OptimizeImageOptions {
  buffer: Buffer;
  maxSizeKB?: number;
  width?: number;
  height?: number;
  format?: 'webp' | 'jpeg';
}

export async function optimizeImage(
  options: OptimizeImageOptions
): Promise<Buffer> {
  const {
    buffer,
    maxSizeKB = 300,
    width = 1920,
    height = 1080,
    format = 'webp'
  } = options;

  let quality = 85;
  let optimizedBuffer = await sharp(buffer)
    .resize(width, height, { fit: 'inside', withoutEnlargement: true });

  if (format === 'webp') {
    optimizedBuffer = optimizedBuffer.webp({ quality });
  } else {
    optimizedBuffer = optimizedBuffer.jpeg({ quality });
  }

  let result = await optimizedBuffer.toBuffer();

  // If image is too large, reduce quality iteratively
  while (result.length > maxSizeKB * 1024 && quality > 50) {
    quality -= 5;
    result = await sharp(buffer)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      [format === 'webp' ? 'webp' : 'jpeg']({ quality })
      .toBuffer();
  }

  return result;
}
```

### 4. Frontend Component

Create `/components/admin/image-generator.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageGeneratorProps {
  questionId?: string;
  initialPrompt?: string;
  initialStyle?: string;
  initialAspectRatio?: string;
  onImageGenerated?: (imageUrl: string) => void;
}

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9 (Widescreen)' },
  { value: '9:16', label: '9:16 (Portrait)' },
  { value: '1:1', label: '1:1 (Square)' },
  { value: '4:3', label: '4:3 (Classic)' },
  { value: '3:4', label: '3:4 (Portrait Classic)' },
] as const;

export function ImageGenerator({
  questionId,
  initialPrompt = '',
  initialStyle = '',
  initialAspectRatio = '16:9',
  onImageGenerated
}: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [style, setStyle] = useState(initialStyle);
  const [aspectRatio, setAspectRatio] = useState(initialAspectRatio);
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter an image prompt');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          style: style || undefined,
          aspectRatio,
          questionId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedUrl(data.imageUrl);
      toast.success('Image generated successfully!');
      
      if (onImageGenerated) {
        onImageGenerated(data.imageUrl);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="prompt">Image Prompt *</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          rows={4}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="style">Image Style (Optional)</Label>
        <Textarea
          id="style"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          placeholder="Photorealistic, historically accurate biblical scene, warm candlelight..."
          rows={2}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="aspectRatio">Aspect Ratio</Label>
        <Select value={aspectRatio} onValueChange={setAspectRatio}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASPECT_RATIOS.map((ratio) => (
              <SelectItem key={ratio.value} value={ratio.value}>
                {ratio.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <ImageIcon className="mr-2 h-4 w-4" />
            Generate Image
          </>
        )}
      </Button>

      {generatedUrl && (
        <div className="mt-4">
          <Label>Generated Image</Label>
          <img
            src={generatedUrl}
            alt="Generated"
            className="mt-2 rounded-lg border w-full max-w-md"
          />
        </div>
      )}
    </div>
  );
}
```

---

## Environment Variables

Add to `.env.local`:

```bash
NANOBANANA_API_KEY=your_api_key_here
```

---

## Package Dependencies

Install required packages:

```bash
pnpm add sharp
pnpm add -D @types/sharp
```

**Note:** `sharp` is a native module. If you encounter installation issues on certain platforms, you may need to install platform-specific dependencies.

---

## Supabase Storage Setup

### 1. Create Storage Bucket

In Supabase Dashboard:
- Go to Storage
- Create new bucket: `question-images`
- Make it **public** (for CDN delivery)
- Enable CORS if needed

### 2. Storage Policies

Create RLS policies (if using RLS):

```sql
-- Allow admins to upload images
CREATE POLICY "Admins can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'question-images' AND
  (SELECT is_admin FROM users WHERE id = auth.uid()) = true
);

-- Allow public read access
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'question-images');
```

---

## Error Handling

### Common Errors

1. **401 Unauthorized**: Invalid or missing API key
2. **400 Bad Request**: Invalid prompt or request format
3. **429 Too Many Requests**: Rate limit exceeded (check free tier limits)
4. **500 Internal Server Error**: API service error

### Retry Logic

Implement exponential backoff for transient errors:

```typescript
async function generateWithRetry(options: GenerateImageOptions, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = await generateImageWithNanoBanana(options);
    
    if (result.success) {
      return result;
    }
    
    // Don't retry on client errors (4xx)
    if (result.error?.includes('400') || result.error?.includes('401')) {
      return result;
    }
    
    // Wait before retry (exponential backoff)
    if (attempt < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  return {
    success: false,
    error: 'Max retries exceeded'
  };
}
```

---

## Testing Checklist

- [ ] API key configuration
- [ ] Image generation with text prompt
- [ ] Image generation with style
- [ ] Different aspect ratios
- [ ] Image optimization (size < 300KB)
- [ ] Supabase Storage upload
- [ ] Database record update
- [ ] Error handling (invalid API key)
- [ ] Error handling (network failure)
- [ ] Retry logic
- [ ] Admin authentication
- [ ] Rate limiting awareness

---

## Cost Considerations

**NanoBanana offers a free tier**, but check:
- Daily/monthly request limits
- Image generation limits
- Rate limiting rules
- Upgrade pricing if needed

Monitor usage in the admin dashboard to track API calls.

---

## Next Steps

1. **Get API Key**: Sign up at [nanobananai.com](https://www.nanobananai.com)
2. **Set Environment Variable**: Add `NANOBANANA_API_KEY` to `.env.local`
3. **Install Dependencies**: `pnpm add sharp`
4. **Create Supabase Bucket**: Set up `question-images` bucket
5. **Implement API Utility**: Create `/lib/utils/nanobanana.ts`
6. **Create API Route**: Create `/app/api/admin/generate-image/route.ts`
7. **Create UI Component**: Create `/components/admin/image-generator.tsx`
8. **Test Integration**: Generate test images
9. **Integrate with Admin Dashboard**: Add to question forms

---

## References

- [NanoBanana Documentation](https://www.nanobananai.com/docs.html)
- [Google Gemini API Format](https://ai.google.dev/docs/gemini_api_overview) (NanoBanana is compatible)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)

