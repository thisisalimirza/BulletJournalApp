const config = {
  appId: "com.braskgroup.bulletjournal",
  appName: "Bullet Journal",
  webDir: "out",
  plugins: {
    StatusBar: {
      style: "DEFAULT",
      backgroundColor: "#faf8f5",
      overlaysWebView: false,
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchShowDuration: 500,
      backgroundColor: "#faf8f5",
      showSpinner: false,
    },
  },
  ios: {
    contentInset: "always",
    scrollEnabled: true,
    backgroundColor: "#faf8f5",
  },
};

export default config;
