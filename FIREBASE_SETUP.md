# Firebase + GitHub Pages setup

This site is ready for Firebase Authentication and Cloud Firestore. Complete these one-time steps in your own Firebase account, then publish the repository with GitHub Pages.

## 1. Create the Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/) and create a project on the free Spark plan.
2. Add a **Web app** to the project.
3. Open **Project settings** and copy the Firebase configuration values into `firebase-config.js`.

The Firebase web configuration is designed to be used in browser code. Do not add a service-account JSON file, private key, or admin key to this project.

## 2. Enable Authentication

In **Build → Authentication → Sign-in method**, enable **Email/Password**.

Create these users in **Authentication → Users**:

| Website username | Firebase email |
| --- | --- |
| Lamisa | `lamisa@wishinercia.app` |
| us | `us@wishinercia.app` |

⛔ **Security warning:** Choose a **strong, private password** for every user. Do **not** use simple passwords like `123456` or `000000`, and **never** write passwords in this file or anywhere in the repository — a public GitHub Pages repo means everyone can read them. Keep passwords only in your password manager, and share them privately with the recipient.

After creating each account, copy its **User UID**. It is needed for the Firestore document ID below.

## 3. Create Firestore user profiles

In **Build → Firestore Database**, create a database in Production mode. Create a collection named `users`.

Create one document per Firebase user. The document ID must be that user's Firebase Authentication UID.

### Lamisa document

```text
username: "lamisa"
displayName: "Lamisa"
siteType: "birthday"
siteConfig: {
  title: "🥰 Happy Birthday Madam Ji 🥰",
  message: "Mohtarma...\n\nAap meri kahani ka woh hissa hain..."
}
```

### us document

```text
username: "us"
displayName: "us"
siteType: "no_context"
siteConfig: {}
```

`siteType` can be `birthday` or `no_context`. New users can have their own `displayName`, `siteType`, and `siteConfig`, all without changing the shared website layout.

## 4. Lock Firestore rules

In **Firestore Database → Rules**, publish these rules. They ensure that a signed-in user can read only their own profile and cannot edit the database from the website.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false;
    }
  }
}
```

## 5. Publish with GitHub Pages

Commit all files, then in GitHub open **Settings → Pages** and deploy from the main branch / root folder. Your normal `github.io` link will work; no PHP hosting is required.

The private password step re-checks the same Firebase password, so it remains server-verified rather than being stored in JavaScript.
