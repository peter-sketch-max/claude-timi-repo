# Putting Company Simulator on Google Play

The code part is done: the game is wrapped as a real Android app, and GitHub builds it for you. What's left are the steps only you can do, because they need your Google account, an ID check and a payment.

Do them in this order.

---

## 1. Try the app on your phone (free, 5 minutes)

Every time code is pushed, GitHub builds a test version of the app.

1. On GitHub, open this repository and click the **Actions** tab.
2. Click the latest **Android build** run that has a green ✅.
3. Scroll down to **Artifacts** and download **company-simulator-test-apk**. It comes as a `.zip`.
4. Unzip it. Inside is `app-debug.apk`.
5. Send the file to your Android phone (Google Drive, email, or USB) and tap it.
6. Your phone will ask to allow "install unknown apps". Say yes for this one install.

In this test version the VIP button won't work. Payments only work once the app is installed from Google Play (see step 8).

---

## 2. Choose your app ID (important: you can never change it)

Every app on Google Play has a unique ID. Right now it is:

```
com.companysim.game
```

Once you upload the app, this ID is **permanent**. If someone else already uses it, Google will reject it. A safer choice includes your own name, for example `com.yourname.companysim`.

**If you want a different ID, tell Claude before your first upload.** It has to be changed in a few files at once (`capacitor.config.json`, `android/app/build.gradle`, the `MainActivity.java` folder, `strings.xml`, and the share link `CS.SHARE_URL` at the bottom of `src/js/data.js`).

---

## 3. Make your upload key (once, 5 minutes)

Google only accepts apps that are signed with your own secret key. You create it once and keep it forever.

You need Java installed. Android Studio includes it, or get it from [adoptium.net](https://adoptium.net).

Open a terminal (Mac: Terminal, Windows: PowerShell) and run:

```
keytool -genkeypair -v -keystore upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

It will ask for a password and your name. **Write the password down.** This creates a file called `upload.jks`.

> ⚠️ Back up `upload.jks` and its password somewhere safe, like a password manager or a USB stick. **Never** put it in the repository; the `.gitignore` already blocks it. If you lose it, Google support can reset it, but that takes days.

Next, turn the file into text so GitHub can store it:

- **Mac:** `base64 -i upload.jks | pbcopy` (this copies it for you)
- **Windows (PowerShell):** `[Convert]::ToBase64String([IO.File]::ReadAllBytes("upload.jks")) | Set-Clipboard`
- **Linux:** `base64 -w0 upload.jks`

---

## 4. Give the key to GitHub (once)

On GitHub, go to **Settings → Secrets and variables → Actions → New repository secret** and add these four secrets:

| Name | Value |
|---|---|
| `KEYSTORE_BASE64` | the long text you just copied |
| `KEYSTORE_PASSWORD` | your keystore password |
| `KEY_ALIAS` | `upload` |
| `KEY_PASSWORD` | the same password (unless you picked a different one for the key) |

From now on, every build also makes **company-simulator-play-store-aab**. That `.aab` file is what you upload to Google Play.

To get a new build without changing any code: **Actions → Android build → Run workflow**.

---

## 5. Create a Google Play developer account (once)

1. Go to [play.google.com/console](https://play.google.com/console) and sign up.
2. It costs **$25, one time**.
3. You must be **18 or older**. If you're younger, a parent or guardian needs to create the account in their name.
4. Google will check your ID, which can take a few days.
5. Choose a **Personal** account unless you have a registered company.

---

## 6. Create the app in Play Console

1. Click **Create app**.
2. Enter:
   - App name: `Company Simulator`
   - Default language: English
   - App or game: **Game**
   - Free or paid: **Free** (VIP is a subscription inside the free app)
3. Fill in the **store listing**. All the text is ready in [`store/listing.md`](store/listing.md), and the pictures are in the `store/` folder:

| What Play asks for | File |
|---|---|
| App icon (512×512) | `store/playstore-icon-512.png` |
| Feature graphic (1024×500) | `store/feature-graphic-1024x500.png` |
| Phone screenshots | `store/screenshot-1-title.png` … `store/screenshot-8-chat.png` |

---

## 7. Answer the "App content" forms

These are in Play Console under **Policy → App content**.

- **Privacy policy:** Google needs a web link. The policy is written in [`PRIVACY.md`](PRIVACY.md).
  - Put your email in it first.
  - If this repository is public, you can use the GitHub link to that file.
  - If it's private, paste the text into a free page (for example Google Sites) and use that link.
- **Ads:** No, the app has no ads. (The "Ads" tab is a pretend in-game feature where your company appears in ads. There are no real ads.)
- **App access:** All features are available without a login.
- **Content rating:** Fill in the questionnaire honestly.
  - There's no bad language and no real gambling.
  - Some event texts mention a customer slapping the boss, and a few gently mention an old worker or pet passing away. There are no pictures of this, only text. Answer the violence questions honestly (this usually counts as mild, text-only content).
  - The **lucky wheel** and **mystery boxes** only use pretend in-game money. You can never pay real money for spins. Some questionnaires still count this as "simulated gambling", so answer based on what the question says.
  - If the rating comes out higher than you want, Claude can rename or change those mini-games.
- **Target audience:** This one matters.
  - **13 and up** is the easy route.
  - If you include **under 13**, the app must follow Google's stricter **Families policy**. The game already collects no data and has no ads, which helps, but review is stricter and takes longer.
  - Recommendation: start with **13+**. You can add younger ages later.
- **Data safety:** The app **collects no data and shares no data**.
  - Game saves stay on the phone.
  - Payments are handled by Google Play itself, not by the app.
  - War codes are sent by the player through their own share menu. The app has no server and never uploads them.
- **Government apps / news / health / financial features:** No.

---

## 8. Set up the VIP subscription

1. First, set up a **payments profile**: Play Console → **Settings → Payments profile**. This is where Google pays you.
2. Upload the `.aab` once to **Testing → Internal testing** (step 9). Google only lets you create products after the app has been uploaded once.
3. Go to **Monetize → Products → Subscriptions → Create subscription**:
   - Product ID: **`vip_monthly`** (it must match exactly, since the game looks for this name)
   - Name: `VIP`
   - Benefits: *VIP companies · Double daily gifts · Faster Boss Powers · 4 missions · 2x offline earnings*
4. Add a **base plan**:
   - Auto-renewing, billing period **1 month**
   - Set a price, for example $2.99
   - Click **Activate**
5. To test paying without being charged, go to **Settings → License testing** and add your Gmail. Test purchases are then free.

What VIP unlocks in the game:
- 7 VIP companies: Space Company, Theme Park, Zoo, Esports Team, YouTube Channel, Music Label, Social Media App
- Double daily gifts
- Powers recharge 1 week faster
- A 4th mission slot
- 2x offline earnings
- VIP logos

---

## 9. Testing, then launch

1. **Internal testing** (instant, up to 100 people you choose):
   - Go to **Testing → Internal testing → Create release**.
   - Upload `app-release.aab` and roll it out.
   - Testers get a link and install the app from Google Play. This is where VIP payments can be tested.
2. **Closed testing** (required for new personal accounts):
   - Google requires at least **12 testers** to keep the app installed for **14 days in a row** before you can go public.
   - Friends and family with Android phones work.
3. **Production:**
   - After the 14 days, click **Apply for production**.
   - Answer a few questions and submit. Google reviews it, usually in a few days.

### Updating the game later

1. Push the code change. GitHub builds a new `.aab` with a higher version number automatically.
2. Download it from **Actions**.
3. In Play Console, **create a new release** and upload it.

---

## Checklist

- [ ] Tried the test APK on a phone
- [ ] Decided on the app ID (step 2)
- [ ] Made `upload.jks` and backed it up
- [ ] Added the 4 GitHub secrets
- [ ] Play Console account created and verified
- [ ] Store listing filled in and pictures uploaded
- [ ] Privacy policy link (with your email in it)
- [ ] Content rating, target audience, data safety done
- [ ] Payments profile + `vip_monthly` subscription active
- [ ] Internal test works, VIP purchase tested
- [ ] 12 testers × 14 days of closed testing
- [ ] Applied for production 🚀
