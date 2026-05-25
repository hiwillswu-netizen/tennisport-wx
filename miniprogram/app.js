App({
  onLaunch: function () {
    this.loadBrandFonts();

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'willswu-d1gttwhxle25af194',
        traceUser: true,
      });
    }

    this.globalData = {};
  },
  loadBrandFonts: function () {
    const fonts = [
      {
        family: 'Playfair Display',
        source: 'url("https://cdn.jsdelivr.net/fontsource/fonts/playfair-display:vf@latest/latin-wght-normal.woff2")'
      },
      {
        family: 'Manrope',
        source: 'url("https://cdn.jsdelivr.net/fontsource/fonts/manrope:vf@latest/latin-wght-normal.woff2")'
      }
    ];

    fonts.forEach((font) => {
      wx.loadFontFace({
        family: font.family,
        source: font.source,
        global: true,
        fail: (err) => {
          console.warn(`${font.family} load failed`, err);
        }
      });
    });
  },
  globalData: {
    userInfo: null,
    openid: null
  }
});
