# Content Document Link (ContentDocumentLink)

**API Name:** `ContentDocumentLink`

**Total Fields:** 7

---

## Standard Fields (7)

| Field Label | API Name | Type | Required | Unique | External ID | Description |
|------------|----------|------|----------|--------|-------------|-------------|
| ContentDocumentLink ID | `Id` | id | ✓ |  |  |  |
| Linked Entity ID | `LinkedEntityId` | reference | ✓ |  |  |  |
| Content Document ID | `ContentDocumentId` | reference | ✓ |  |  |  |
| Is Deleted | `IsDeleted` | boolean | ✓ |  |  |  |
| Last Modified Date | `SystemModstamp` | datetime | ✓ |  |  |  |
| Share Type | `ShareType` | picklist |  |  |  |  |
| Visibility | `Visibility` | picklist |  |  |  |  |


## Picklist Values

### Share Type (`ShareType`)

**Active Values:** 3

```
- "V"
- "C"
- "I"
```

### Visibility (`Visibility`)

**Active Values:** 3

```
- "AllUsers"
- "InternalUsers"
- "SharedUsers"
```

