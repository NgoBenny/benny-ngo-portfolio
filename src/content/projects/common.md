---
title: Common
subtitle: community / full-stack application
summary: A full-stack community discussion app with responsive feeds, rich-text posts, and readable threaded replies. Server-side permissions, scoped participation restrictions, and reversible community removal connect moderation controls to persistent data.
order: 2
category: Full-stack development
period: Personal software project
technologies: [Next.js, TypeScript, PostgreSQL, Prisma, Tailwind CSS]
thumbnail: ../../assets/common.png
thumbnailAlt: Common’s public search results showing its indigo and lavender identity, desktop community navigation, feed filters, and a rich-text test post.
caption: A current capture of Common’s public interface, filtered to a real rich-text test post. The screen shows desktop navigation, search, voting, and saved-post controls.
sourceVisibility: public
repositoryUrl: https://github.com/NgoBenny/common
demoUrl: https://common-ngobenny.vercel.app
highlights:
  - value: Full-stack
    label: Interface to persistence
  - value: PostgreSQL
    label: Relational data model
  - value: Auth + roles
    label: Server-side permissions
architecture:
  - title: Interface
    detail: Next.js + TypeScript
  - title: Identity
    detail: Kinde authentication
  - title: Actions
    detail: Validation + permissions
  - title: Storage
    detail: Prisma + PostgreSQL
---

## The problem

Common started as Reddit Clone 2.0. I’ve since given it its own identity and responsive interface, while working on the details of posting and discussion: who can edit a post, how a vote survives a reload, and what happens to a draft when a submission fails.

The app uses Next.js and TypeScript, with Prisma and PostgreSQL for storage. Kinde handles authentication and UploadThing handles image uploads. Users can create or join communities, publish posts, reply to comments, and vote. They can also search and sort feeds, discover communities, save posts, view profiles, and check in-app notifications.

My work builds on the original scaffold and existing libraries. I’ve extended the community interactions, fixed reliability issues, and redesigned the interface. The merged changes include responsive navigation, a shared post composer, and explicit sign-in choices.

## Engineering decisions

### Enforce permissions where data changes

An edit button can be hidden, but someone can still send the request directly. Server actions validate the input and check whether the signed-in user can change that record.

Community creators can ban users from their own communities. The site moderator can restrict users across Common and remove or restore communities. Each protected write checks the database for current restrictions and their expiry. Transaction locks prevent participation writes from racing with a ban or community removal. Removed communities keep their content for restoration; restricted users can still read and erase their own content where permitted.

### Make voting consistent

The stored vote, score, and selected button need to agree when someone changes their vote or reloads the page. Keeping separate client booleans for those states can let them drift apart.

The selected button comes from the saved vote. Writes use a serializable transaction with bounded conflict retries, and page invalidation keeps the feed and post detail in sync. This uses the existing state handling without a separate state-management layer.

### Keep drafts when an action fails

Failed posts and comments keep the text the user wrote and show validation feedback. The server limits text and rich-text input. The renderer reads the editor’s document structure without spreading arbitrary stored attributes into the page.

Invalid pagination falls back safely. Missing communities have a not-found page, and mobile layouts keep posts and controls within the viewport.

ProseMirror’s null-prototype attributes caused a transport problem with React server actions. The composer converts editor JSON into plain objects before creating or editing a post. The server still validates that input.

### Make the same workflows usable across devices

The redesign gives Common cream surfaces, indigo and lavender accents, and light and dark themes. Desktop browsing uses a navigation rail and a contextual community panel. On smaller screens, navigation moves to a bottom bar exposing the joined feed, Explore, Post, Saved, and Notifications; search gets its own header row where space is limited.

A shared composer handles creation and editing, with title, rich text, attachment preview, and community flair. Users cannot submit while an upload is in progress, and failed submissions keep the draft. Kinde login shows sign-in choices. The account menu has a Switch account option, while sessions persist during normal browsing.

Threaded comments limit visual indentation, wrap long content, and place action menus beside reply controls. Inline reply composers preserve cancelled drafts and return keyboard focus to Reply. Targeted browser checks cover deep nesting, keyboard collapse, focus, draft retention, and mobile overflow.

### Bound vulnerable tooling

The project applies checksum-verified nesting-depth guards to the `braces` dependency used by build and lint tooling. Installation and prebuild checks verify the patch, and bounded attack tests exercise it. The audit exception covers only the documented advisory and expires October 17, 2026 UTC; raw npm audit still reports the upstream vulnerability.

## Demonstrated functionality

The repository contains authentication, communities, rich-text and image posts, threaded replies, votes, private saves, profiles, discovery, notifications, community rules and flair, and report-review controls. It includes runnable regression, feature, browser, and database-safety checks. Its feature report documents checks against an isolated PostgreSQL database, including guest writes, other-author edits, cross-community moderation, and private notification access; those are reported project checks, not portfolio visitor tests.

The project’s recovery work also exposed an operational dependency: when its hosted database became unavailable, the homepage failed even though the deployment itself had completed. Restoring the data and connection configuration brought the application back. That experience informed the project’s database diagnostics and recovery documentation.

I don’t have adoption figures or performance benchmarks for Common.

## Limitations and lessons

The app depends on hosted authentication, database, and upload services, each of which can fail even after a successful build. The Common demo address redirects to the existing production address, which displays the redesigned interface. The release notes cover migration and domain cutover; I haven’t independently verified every production workflow described here.

Notifications refresh on navigation or reload, without push delivery. Search uses PostgreSQL ILIKE, and post pages load the reply tree. Indexed search and thread pagination would be worth adding if measured usage calls for them; scalability hasn’t been benchmarked.

The moderation release requires an additive database migration and backup verification. The code and regression tests do not confirm that the production migration or every restricted-user workflow has been verified.

Working on Common has made me pay closer attention to what happens after someone clicks a button, especially failed submissions and state that needs to survive a reload.
