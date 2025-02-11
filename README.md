# SOEN-390
temp readme for repo setup (maybe we move this somewhere else later)

## Frontend

```
cd frontend
npm install -g expo-cli
npm install
npx expo start
```

## Backend

```
cd backend
npm install
node app.js
```


## Local Development (iOS)
 
You can install Expo Go on the app store. Use your camera to scan the qr code generated when running `npx expo start`. You should be good to go.

## Local Development (Android)



## Local Development (Emulation) (Needed for functionalities involving Auth0) (All terminal commands are to be executed from frontend folder)

(I am guessing that steps 3 to 6 can be skipped since I already created the build, someone please confirm. If not then probably at least step 6.)
1. Install Android Studio and run an Android emulation. (on my laptop Medium Phone works a lot smoother than Pixel 9 Pro XL)
2. npm install -g eas-cli
3. create an expo.dev account online
4. eas login
5. eas init
6. eas build -p android --profile development    (this will take a while to run)
7. Copy the following link into the browser of your emulator to download the apk file: https://expo.dev/accounts/ricobadir/projects/frontend/builds/01a2cd5c-1cb1-4f24-bdbf-ce83ce1a1d49
8. npx expo start
9. press a to open android
