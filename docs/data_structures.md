# Data Structures

Reference for the main data structures used across the app — what lives in the database, what lives in storage, and how those shapes are represented on the frontend.

---

## Database (Firestore)

### `books` collection

Each document represents an audiobook. Documents are stored at `books/{bookId}`.

| Field         | Type               | Description                                                        |
| ------------- | ------------------ | ------------------------------------------------------------------ |
| `id`          | `string`           | Auto-generated document ID (also embedded in the document body)    |
| `title`       | `string`           | Book title                                                         |
| `description` | `string`           | Book description / synopsis                                        |
| `author`      | `string[]`         | List of author names (stored as plain strings, not references)     |
| `genres`      | `string[]`         | List of Genre document IDs (references into the `genres` collection) |
| `topics`      | `string[]`         | List of Topic IDs                                                  |
| `tags`        | `string[]`         | List of Tag IDs                                                    |
| `moods`       | `string[]`         | List of Mood IDs                                                   |
| `language`    | `string`           | Language ID                                                        |
| `duration`    | `number`           | Total duration in seconds (derived from chapters on the client)    |
| `cover`       | `BookImage` object | Cover image (see sub-structure below)                              |
| `chapters`    | `Chapter[]`        | Ordered array of chapter objects (embedded, not sub-collections)   |

#### Embedded: `Chapter`

| Field       | Type              | Description                                           |
| ----------- | ----------------- | ----------------------------------------------------- |
| `id`        | `string`          | UUID for the chapter                                  |
| `title`     | `string`          | Chapter / episode title                               |
| `audioSrc`  | `string`          | Firebase Storage path to the audio file               |
| `duration`  | `number`          | Duration in seconds                                   |
| `images`    | `BookImage[]`     | Timed images displayed during playback                |
| `subtitles` | `Subtitle[]`      | Timed subtitle / caption entries                      |

#### Embedded: `BookImage`

| Field       | Type     | Description                                      |
| ----------- | -------- | ------------------------------------------------ |
| `id`        | `string` | Optional identifier                              |
| `imageLink` | `string` | Firebase Storage path (or full URL) to the image |
| `timestamp` | `number` | Start time (seconds) when the image appears      |
| `duration`  | `number` | How long the image is displayed (seconds)        |

#### Embedded: `Subtitle`

| Field       | Type     | Description                          |
| ----------- | -------- | ------------------------------------ |
| `id`        | `string` | Optional identifier                  |
| `text`      | `string` | Subtitle text content                |
| `timestamp` | `number` | Start time (seconds)                 |
| `duration`  | `number` | Display duration (seconds)           |

---

### `genres` collection

Each document represents a genre. Documents are stored at `genres/{genreId}`.

| Field  | Type                            | Description                                                                                 |
| ------ | ------------------------------- | ------------------------------------------------------------------------------------------- |
| `id`   | `string`                        | Auto-generated document ID                                                                  |
| `name` | `Record<string, string>` or `string` | Localized name map (e.g. `{ "en": "Fiction", "ht-ht": "Fiksyon" }`). Legacy docs may store a plain string. |

> **Note:** The Zod schema normalizes a plain `string` into `{ en: value }` on parse, so the client always works with a `Record<string, string>`.

---

### Other taxonomy collections (referenced by ID in `books`)

The following share the same shape as `genres`. They are referenced by their document IDs in the corresponding `books` arrays (`topics`, `tags`, `moods`, `language`).

| Collection | Schema name       | `name` type                           |
| ---------- | ----------------- | ------------------------------------- |
| Topics     | `topicSchema`     | `Record<string, string>` (localized)  |
| Tags       | `tagSchema`       | `Record<string, string>` (localized)  |
| Moods      | `MoodSchema`      | `string`                              |
| Languages  | `languageSchema`  | `string`                              |
| Authors    | `authorSchema`    | `string`                              |

> **Current status:** `books.author` stores plain name strings (not IDs). The `authorSchema` exists in the schema file but authors are not yet managed as a separate collection via the API.

---

### `users` collection

Each document represents a user. Documents are stored at `users/{userId}`.

| Field           | Type       | Description                                                     |
| --------------- | ---------- | --------------------------------------------------------------- |
| `id`            | `string`   | Auto-generated document ID                                      |
| `email`         | `string`   | User email address                                              |
| `displayName`   | `string`   | User-friendly display name                                      |
| `avatar`        | `string`   | URL or storage path to the user's avatar image                  |
| `roles`         | `string[]` | List of Role document IDs (references into the `roles` collection) |
| `permissions`   | `string[]` | List of Permission document IDs (directly assigned, beyond roles)  |

---

### `roles` collection

Each document represents a role. Documents are stored at `roles/{roleId}`.

| Field           | Type       | Description                                                           |
| --------------- | ---------- | --------------------------------------------------------------------- |
| `id`            | `string`   | Auto-generated document ID                                            |
| `name`          | `string`   | Role name (e.g. `admin`, `editor`, `viewer`)                          |
| `description`   | `string`   | Human-readable description of the role                                |
| `permissions`   | `string[]` | List of Permission IDs that come with this role                       |

---

### `permissions` collection

Each document represents an atomic permission. Documents are stored at `permissions/{permissionId}`.

| Field           | Type     | Description                                             |
| --------------- | -------- | ------------------------------------------------------- |
| `id`            | `string` | Auto-generated document ID                              |
| `name`          | `string` | Permission name (e.g. `books:create`, `books:delete`)   |
| `description`   | `string` | Human-readable description of what this permission allows |

---

## Firebase Storage

Media files are organized under these paths:

```
books/
  {bookId}/
    chapters/
      {chapterId}/
        audio/
          {uuid}.{ext}       ← chapter audio files
        images/
          {uuid}.{ext}       ← timed chapter images
covers/
  {fileName}                 ← book cover images (legacy path in storage rules)
chapters/
  {fileName}                 ← chapter audio (legacy path in storage rules)
```

Storage paths are stored in Firestore fields (`audioSrc`, `imageLink`). At read time the client calls `POST /api/storage/download-url` with the path to get a signed URL (7-day expiry).

---

## Frontend Structures

### Zod Schemas (`Book.schema.ts`)

All data flowing between the API and the client is validated with Zod. The schemas mirror the Firestore shapes above:

| Schema                 | Inferred Type        | Purpose                           |
| ---------------------- | -------------------- | --------------------------------- |
| `bookSchema`           | `BookData`           | Full book document                |
| `chapterSchema`        | `ChapterData`        | Single chapter                    |
| `bookImageSchema`      | `BookImageData`      | Timed image                       |
| `subtitleSchema`       | `SubtitleData`       | Timed subtitle                    |
| `genreSchema`          | `GenreData`          | Genre with localized name         |
| `topicSchema`          | `TopicData`          | Topic with localized name         |
| `tagSchema`            | `TagData`            | Tag with localized name           |
| `MoodSchema`           | `MoodData`           | Mood                              |
| `languageSchema`       | `LanguageData`       | Language                          |
| `authorSchema`         | `AuthorData`         | Author                            |
| `bookResponseSchema`   | `BookResponseData`   | Single-book API response (= `bookSchema`) |
| `booksResponseSchema`  | `BooksResponseData`  | Array-of-books API response       |

### Zod Schemas (`User.schema.ts`)

| Schema                       | Inferred Type              | Purpose                                  |
| ---------------------------- | -------------------------- | ---------------------------------------- |
| `permissionSchema`           | `PermissionData`           | Atomic permission                        |
| `roleSchema`                 | `RoleData`                 | Role with associated permission IDs      |
| `userSchema`                 | `UserData`                 | User with roles and direct permissions   |
| `userResponseSchema`         | `UserResponseData`         | Single-user API response (= `userSchema`) |
| `usersResponseSchema`        | `UsersResponseData`        | Array-of-users API response              |
| `rolesResponseSchema`        | `RolesResponseData`        | Array-of-roles API response              |
| `permissionsResponseSchema`  | `PermissionsResponseData`  | Array-of-permissions API response        |

---

### Reactive Classes (`Book.svelte.ts`)

Plain data objects from the API are wrapped in Svelte 5 reactive classes. Each class uses `$state` for mutable fields and provides `toPOJO()` / `toString()` for serialization.

#### `Book`

```ts
class Book {
  id:          string
  title:       string
  description: string
  author:      string[]
  chapters:    Chapter[]
  cover:       BookImage
  duration:    number        // $derived — sum of chapter durations
  genres:      string[]
  topics:      string[]
  tags:        string[]
  moods:       string[]
  language:    string
}
```

#### `Chapter`

```ts
class Chapter {
  id:        string
  title:     string
  audioSrc:  string
  duration:  number
  images:    BookImage[]
  subtitles: Subtitle[]
  player:    Player          // per-chapter audio player (private, exposed via getter)
}
```

#### `BookImage`

```ts
class BookImage {
  imageLink: string
  alt:       string
  timestamp: number
  duration:  number
}
```

#### `Subtitle`

```ts
class Subtitle {
  timestamp: number
  duration:  number
  text:      string
}
```

---

### Reactive Classes (`User.svelte.ts`)

#### `Permission`

```ts
class Permission {
  id:          string
  name:        string
  description: string
}
```

#### `Role`

```ts
class Role {
  id:          string
  name:        string
  description: string
  permissions: string[]   // permission IDs that come with this role
}
```

#### `User`

```ts
class User {
  id:             string
  email:          string
  displayName:    string
  avatar:         string
  roles:          string[]   // role IDs
  permissions:    string[]   // directly assigned permission IDs
  allPermissions: string[]   // $derived — union of role-based + direct permissions
}
```

Key methods:
- `resolveRoles(allRoles: Role[])` — populate resolved roles so `allPermissions` computes correctly
- `hasRole(roleId)` / `hasPermission(permissionId)` — check membership
- `addRole(roleId)` / `removeRole(roleId)` — mutate role assignments
- `addPermission(permissionId)` / `removePermission(permissionId)` — mutate direct permissions

---

### Audio Player Structures

#### `IPlayer` (interface)

Common contract implemented by both `Player` and `GlobalPlayer`:

```ts
interface IPlayer {
  readonly status: 'playing' | 'paused' | 'pending'
  readonly duration: number
  readonly currentTime: number
  play(): void
  pause(): void
  seek(time: number): void
}
```

#### `Player`

Per-chapter player. Wraps a `SvelteHowl` instance, resolves storage paths to download URLs, and exposes reactive playback state.

#### `GlobalPlayer` (singleton)

App-wide persistent player (`globalPlayer`). Manages cross-page playback continuity by:

- Tracking `currentBookId`, `currentChapterId`, and `currentChapter`
- Persisting / restoring state to/from `localStorage` (`globalPlayerState` key)
- Auto-saving progress every 5 seconds while playing

#### `SvelteHowl`

Svelte 5-reactive wrapper around [Howler.js](https://howlerjs.com/). Uses `createSubscriber` + `requestAnimationFrame` to make `playing`, `paused`, `currentTime`, `duration`, `volume`, and `state` reactive getters.

---

### Client-Side Query / Cache State

#### `QueryState<T>` (generic)

Used by the API layer (`books.svelte.ts`, `genres.svelte.ts`) to cache fetched data with staleness tracking:

```ts
type QueryState<T> = {
  data:        T | undefined
  isPending:   boolean
  isError:     boolean
  lastUpdated: number       // timestamp of last successful fetch
  staleTime:   number       // ms before data is considered stale (default: 1 hour)
}
```

Concrete usages:

| State variable      | Type                      | Purpose                  |
| ------------------- | ------------------------- | ------------------------ |
| `booksQueryState`   | `QueryState<Book[]>`      | Cached list of all books |
| `genresQueryState`  | `QueryState<Genre[]>`     | Cached list of all genres |

#### `Genre` (client type)

Inferred from `genreSchema`:

```ts
type Genre = {
  id?:   string
  name?: Record<string, string>   // localized name map
}
```

---

## API Routes Summary

| Method   | Route                          | Firestore Collection | Description                                     |
| -------- | ------------------------------ | -------------------- | ----------------------------------------------- |
| `GET`    | `/api/books`                   | `books`              | List all books                                  |
| `POST`   | `/api/books`                   | `books`, `genres`    | Create a book (auto-creates genres if needed)    |
| `GET`    | `/api/books/[bookId]`          | `books`              | Get a single book                               |
| `PUT`    | `/api/books/[bookId]`          | `books`, `genres`    | Update a book (merge)                           |
| `DELETE` | `/api/books/[bookId]`          | `books`              | Delete a book document                          |
| `GET`    | `/api/genres`                  | `genres`             | List all genres                                 |
| `POST`   | `/api/genres`                  | `genres`             | Create a genre                                  |
| `POST`   | `/api/storage/download-url`    | —                    | Get a signed download URL for a storage path    |
| `GET`    | `/api/users/me`                | `users`              | Get the current user                            |
| `PUT`    | `/api/users/[userId]`          | `users`              | Update a user                                   |
| `GET`    | `/api/roles`                   | `roles`              | List all roles                                  |
| `POST`   | `/api/roles`                   | `roles`              | Create a role                                   |
| `PUT`    | `/api/roles/[roleId]`          | `roles`              | Update a role                                   |
| `DELETE` | `/api/roles/[roleId]`          | `roles`              | Delete a role                                   |
| `GET`    | `/api/permissions`             | `permissions`        | List all permissions                            |
| `POST`   | `/api/permissions`             | `permissions`        | Create a permission                             |
| `DELETE` | `/api/permissions/[permissionId]` | `permissions`     | Delete a permission                             |
