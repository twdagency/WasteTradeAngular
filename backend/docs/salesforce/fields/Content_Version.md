# Content Version (ContentVersion)

**API Name:** `ContentVersion`

**Total Fields:** 45

---

## Standard Fields (44)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| Content Version ID | `Id` | id | ✓ |  |  |  |
| Content Document ID | `ContentDocumentId` | reference | ✓ |  |  |  |
| Is Latest | `IsLatest` | boolean | ✓ |  |  |  |
| Content URL | `ContentUrl` | url |  |  |  |  |
| Content Body ID | `ContentBodyId` | reference |  |  |  |  |
| Version Number | `VersionNumber` | string |  |  |  |  |
| Title | `Title` | string | ✓ |  |  |  |
| Description | `Description` | textarea |  |  |  |  |
| Reason For Change | `ReasonForChange` | string |  |  |  |  |
| Prevent others from sharing and unsharing | `SharingOption` | picklist | ✓ |  |  |  |
| File Privacy on Records | `SharingPrivacy` | picklist | ✓ |  |  |  |
| Path On Client | `PathOnClient` | string |  |  |  |  |
| Rating Count | `RatingCount` | int |  |  |  |  |
| Is Deleted | `IsDeleted` | boolean | ✓ |  |  |  |
| Content Modified Date | `ContentModifiedDate` | datetime |  |  |  |  |
| User ID | `ContentModifiedById` | reference |  |  |  |  |
| Positive Rating Count | `PositiveRatingCount` | int |  |  |  |  |
| Negative Rating Count | `NegativeRatingCount` | int |  |  |  |  |
| Featured Content Boost | `FeaturedContentBoost` | int |  |  |  |  |
| Featured Content Date | `FeaturedContentDate` | date |  |  |  |  |
| Currency ISO Code | `CurrencyIsoCode` | picklist | ✓ |  |  |  |
| Owner ID | `OwnerId` | reference | ✓ |  |  |  |
| Created By ID | `CreatedById` | reference | ✓ |  |  |  |
| Created Date | `CreatedDate` | datetime | ✓ |  |  |  |
| Last Modified By ID | `LastModifiedById` | reference | ✓ |  |  |  |
| Last Modified Date | `LastModifiedDate` | datetime | ✓ |  |  |  |
| System Modstamp | `SystemModstamp` | datetime | ✓ |  |  |  |
| Tags | `TagCsv` | textarea |  |  |  |  |
| File Type | `FileType` | string | ✓ |  |  |  |
| Publish Status | `PublishStatus` | picklist | ✓ |  |  |  |
| Version Data | `VersionData` | base64 |  |  |  |  |
| Size | `ContentSize` | int |  |  |  |  |
| File Extension | `FileExtension` | string |  |  |  |  |
| First Publish Location ID | `FirstPublishLocationId` | reference |  |  |  |  |
| Content Origin | `Origin` | picklist | ✓ |  |  |  |
| Content Location | `ContentLocation` | picklist | ✓ |  |  |  |
| Text Preview | `TextPreview` | string |  |  |  |  |
| External Document Info1 | `ExternalDocumentInfo1` | string |  |  |  |  |
| External Document Info2 | `ExternalDocumentInfo2` | string |  |  |  |  |
| External Data Source ID | `ExternalDataSourceId` | reference |  |  |  |  |
| Checksum | `Checksum` | string |  |  |  |  |
| Major Version | `IsMajorVersion` | boolean | ✓ |  |  |  |
| Asset File Enabled | `IsAssetEnabled` | boolean | ✓ |  |  |  |
| Version Data URL | `VersionDataUrl` | string |  |  |  |  |


## Custom Fields (1)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| Guest Record fileupload | `Guest_Record_fileupload_c__c` | string |  |  |  |  |


## Picklist Values

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

### Currency ISO Code (`CurrencyIsoCode`)

**Active Values:** 3

```
- "GBP" (default)
- "EUR"
- "USD"
```

### Publish Status (`PublishStatus`)

**Active Values:** 3

```
- "U" (default)
- "P"
- "R"
```

### Content Origin (`Origin`)

**Active Values:** 2

```
- "C" (default)
- "H"
```

### Content Location (`ContentLocation`)

**Active Values:** 5

```
- "S" (default)
- "E"
- "L"
- "SfDrive"
- "SCS"
```

