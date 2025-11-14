# Object Storage Setup for Document Uploads

## Overview
The LegalCRM Pro system uses Replit's Object Storage for secure document uploads with ACL (Access Control List) enforcement.

## Setup Requirements

### 1. Create Storage Bucket
1. Open the **Object Storage** pane in Replit
2. Click **Create Bucket**
3. Name your bucket (e.g., `legalcrm-storage`)
4. Note the bucket path (e.g., `/legalcrm-storage/private`)

### 2. Set Environment Variable
Add the following environment variable in the **Secrets** pane:

```
PRIVATE_OBJECT_DIR=/your-bucket-name/private
```

Example:
```
PRIVATE_OBJECT_DIR=/legalcrm-storage/private
```

### 3. Verify Setup
After setting the environment variable:
1. Restart the application
2. Navigate to Documents page
3. Click "Upload Document"
4. Upload a test file
5. Verify you can download it

## Features

### Document Upload
- **Max file size**: 100MB per file
- **Supported formats**: All file types (PDF, DOCX, images, etc.)
- **Security**: Files are private by default, owner-only access
- **Association**: Documents can be linked to clients and cases

### Hawaii Court Forms
- **27 forms** across 9 categories
- **External links** to official Hawaii court PDFs
- **Search & filter** by category and keywords
- **Categories**:
  - Circuit Court - Civil
  - Family Court (Divorce, Protection Orders, Guardianship, Paternity, Adoption)
  - District Court (Civil, Traffic, Criminal)

### Access Control
- All uploads require authentication
- Documents are tied to the uploading user (owner)
- Owner-only download access
- Private by default (not publicly accessible)

## Troubleshooting

### "PRIVATE_OBJECT_DIR not set" Error
**Solution**: Add the `PRIVATE_OBJECT_DIR` environment variable in Secrets pane

### Upload succeeds but download fails with 404
**Solution**: Verify the bucket path in `PRIVATE_OBJECT_DIR` matches your actual bucket name

### Upload button doesn't appear
**Solution**: Ensure you're logged in and navigate to Documents → My Documents tab

## Architecture

### File Flow
1. **Upload**: Client requests presigned URL from `/api/objects/upload`
2. **Direct Upload**: Client uploads directly to Google Cloud Storage
3. **Metadata**: Client sends metadata to `/api/documents` for database storage
4. **ACL**: Server sets owner ACL policy on uploaded file
5. **Download**: Client requests file via `/objects/:path`, server validates ACL and streams file

### Storage Structure
```
/bucket-name/private/uploads/
  ├── uuid-1  (uploaded document 1)
  ├── uuid-2  (uploaded document 2)
  └── uuid-3  (uploaded document 3)
```

### Database Schema
Documents are stored with:
- `filePath`: Normalized path like `/objects/uploads/uuid`
- `uploadedById`: Reference to user who uploaded
- `caseId` / `clientId`: Optional associations
- `documentType`: Category (contract, motion, evidence, etc.)
- `tags`: Array of searchable tags

## Security Notes
- All routes require authentication (`authMiddleware`)
- ACL policy enforces owner-only access
- Files use private visibility by default
- Download routes verify ownership before serving
- Presigned URLs expire after 15 minutes
