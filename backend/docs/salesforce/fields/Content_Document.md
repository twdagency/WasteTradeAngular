# Content Document (ContentDocument)

**API Name:** `ContentDocument`

**Total Fields:** 25

---

## Standard Fields (25)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| Content Document ID | `Id` | id | ✓ |  |  |  |
| Created By ID | `CreatedById` | reference | ✓ |  |  |  |
| Created | `CreatedDate` | datetime | ✓ |  |  |  |
| Last Modified By ID | `LastModifiedById` | reference | ✓ |  |  |  |
| Last Modified Date | `LastModifiedDate` | datetime | ✓ |  |  |  |
| Is Archived | `IsArchived` | boolean | ✓ |  |  |  |
| User ID | `ArchivedById` | reference |  |  |  |  |
| Archived Date | `ArchivedDate` | date |  |  |  |  |
| Is Deleted | `IsDeleted` | boolean | ✓ |  |  |  |
| Owner ID | `OwnerId` | reference | ✓ |  |  |  |
| System Modstamp | `SystemModstamp` | datetime | ✓ |  |  |  |
| Title | `Title` | string | ✓ |  |  |  |
| Publish Status | `PublishStatus` | picklist | ✓ |  |  |  |
| Latest Published Version ID | `LatestPublishedVersionId` | reference |  |  |  |  |
| Parent ID | `ParentId` | reference |  |  |  |  |
| Last Viewed Date | `LastViewedDate` | datetime |  |  |  |  |
| Last Referenced Date | `LastReferencedDate` | datetime |  |  |  |  |
| Description | `Description` | textarea |  |  |  |  |
| Size | `ContentSize` | int |  |  |  |  |
| File Type | `FileType` | string |  |  |  |  |
| File Extension | `FileExtension` | string |  |  |  |  |
| Prevent others from sharing and unsharing | `SharingOption` | picklist |  |  |  |  |
| File Privacy on Records | `SharingPrivacy` | picklist |  |  |  |  |
| Content Modified Date | `ContentModifiedDate` | datetime |  |  |  |  |
| Asset File ID | `ContentAssetId` | reference |  |  |  |  |


## Picklist Values

### Publish Status (`PublishStatus`)

**Active Values:** 3

```
- "U" (default)
- "P"
- "R"
```

### Prevent others from sharing and unsharing (`SharingOption`)

**Active Values:** 2

```
- "A" (default)
- "R"
```

### File Privacy on Records (`SharingPrivacy`)

**Active Values:** 2

```
- "N" (default)
- "P"
```

