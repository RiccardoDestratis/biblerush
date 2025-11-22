# gitcommit


## Pre-commit Checklist

1. **Build the application** to ensure there are no compilation errors
2. **Run e2e tests** (only if major changes were made)
   - If the e2e tests don't cover the changes made, update the test files accordingly and re-run the tests
3. **Create a commit message** that is concise yet descriptive of the latest changes
4. **Push changes** (only if all checks pass)
5. **Clear cache and restart dev server** by executing `restart-dev.sh`
