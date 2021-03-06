# Photos Service

> This service provides the photo url and meta data.

## Related Projects

 - https://github.com/space-work/review-service
 - https://github.com/space-work/amenities-service
 - https://github.com/space-work/contact-widget-service
 - https://github.com/space-work/workspace-service
 - https://github.com/space-work/location-service
 - https://github.com/space-work/workspace-description-service
 - https://github.com/space-work/photos-service
 - https://github.com/space-work/nearby-workspaces

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)

## Usage

## Requirements

An `nvmrc` file is included if using [nvm](https://github.com/creationix/nvm).

- Node 6.13.0
- Mongo 4.4.1

## Development

First time set up:

Run seeding scripts (mongo must be installed and running)
```
npm run seed
```

Start server
```
npm run server:dev
```

### Installing Dependencies

From within the root directory:

```sh
npm install -g webpack
npm install
```
## CRUD API
Endpoint:
```
/api/photos/workspace/:workspaceId
```

### GET
Returns array of database entries for this workspaceId
Format of each entry:
```
{
  id: Number,
  workspaceId: Number,
  description: String,
  url: String,
}
```

### DELETE
Will delete all existing entries for the workspaceId
Example for workspaceId 98:
```
curl -X "DELETE" http://localhost:6001/api/photos/workspace/98
```

### PUT

For an existing workspaceId, will delete all existing entries for the workspaceId and then insert the new ones.
If the workspaceId does not exist, it will insert these photos for the workspaceId.
Descriptions and URL's are required.

Example for workspaceId 98:
```
curl -X "PUT" -d descriptions="['words','hipster words']" -d urls="['www.photo1.com','www.photo2.com']" http://localhost:6001/api/photos/workspace/98
```
