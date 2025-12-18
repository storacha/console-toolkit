# Space Management Example

This example demonstrates how to use **headless space management components** from `@storacha/console-toolkit-react` with **fully custom styling**.

## What this example shows

- Space selection and listing
- Space creation
- Content listing within a space
- File viewing and removal
- File upload (file, directory, and CAR)
- Space sharing
- Custom UI implementation

## Run locally

```bash
pnpm install
pnpm dev
```

## Component Usage

This example uses only headless components, allowing complete control over styling:

```tsx
import { Provider, StorachaAuth } from '@storacha/console-toolkit-react'
import { 
  SpacePicker, 
  SpaceCreator, 
  SpaceList, 
  FileViewer, 
  SharingTool,
  SpaceEnsurer,
  UploadTool 
} from '@storacha/console-toolkit-react'

function App() {
  return (
    <Provider>
      <StorachaAuth>
        <StorachaAuth.Ensurer>
          <SpaceEnsurer>
            <SpacePicker>
              {/* Your custom UI */}
            </SpacePicker>
          </SpaceEnsurer>
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}
```

## Features Demonstrated

1. **SpacePicker** - List and select spaces
2. **SpaceCreator** - Create new spaces (public/private)
3. **SpaceList** - List uploads in a space with pagination
4. **FileViewer** - View file details (Root CID, Gateway URL, Shards)
5. **UploadTool** - Upload files, directories, or CAR files
   - Drag & drop support
   - Upload progress tracking
   - Support for public and private spaces
   - Wrap in directory option
6. **SharingTool** - Share spaces with others via email or DID
7. **SpaceEnsurer** - Ensure at least one space exists

## Upload Features

The upload tool supports multiple upload types:

- **File Upload** - Single file upload with optional directory wrapping
- **Directory Upload** - Upload entire directories
- **CAR Upload** - Upload Content Addressed Archive files
- **Drag & Drop** - Intuitive file selection
- **Progress Tracking** - Real-time upload progress with shard information
- **Private Space Support** - Encrypted uploads for private spaces
- **Upload Another** - Quick reset to upload more files

### Upload Flow

1. Select a space from the space picker
2. Click "Upload a file" button in the list view
3. Choose upload type (file, directory, or CAR)
4. Drag & drop or click to browse files
5. Monitor upload progress
6. View uploaded file in the list
7. Click "Upload Another" to upload more files

## Styling

This example uses vanilla CSS, but you can use any styling solution:

- Tailwind CSS
- Emotion / styled-components
- CSS Modules
- Chakra UI / MUI
- Your own CSS framework

