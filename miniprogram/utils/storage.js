/**
 * 云存储操作封装
 * 包含文件上传、下载、删除等方法
 */

/**
 * 上传单个文件到云存储
 * @param {String} filePath 本地文件路径
 * @param {String} folder 云存储目录，默认 'images'
 * @param {Function} onProgress 上传进度回调
 * @returns {Promise<String>} 文件ID (fileID)
 */
async function uploadFile(filePath, folder = 'images', onProgress) {
  // 提取文件扩展名
  const extMatch = filePath.match(/\.([^.]+)$/);
  const ext = extMatch ? extMatch[1] : 'jpg';

  // 生成云存储路径
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const cloudPath = `${folder}/${timestamp}-${random}.${ext}`;

  return new Promise((resolve, reject) => {
    const uploadTask = wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: (res) => {
        resolve(res.fileID);
      },
      fail: (err) => {
        console.error('上传文件失败', err);
        reject(err);
      }
    });

    // 监听上传进度
    if (onProgress && uploadTask) {
      uploadTask.onProgressUpdate((res) => {
        onProgress(res.progress, res.totalBytesSent, res.totalBytesExpectedToSend);
      });
    }
  });
}

/**
 * 上传图片（会自动压缩）
 * @param {String} filePath 本地图片路径
 * @param {String} folder 云存储目录
 * @param {Object} options 压缩选项
 * @returns {Promise<String>} 文件ID
 */
async function uploadImage(filePath, folder = 'images', options = {}) {
  const {
    compress = true,
    quality = 80,
    maxWidth = 1280,
    maxHeight = 1280
  } = options;

  let finalPath = filePath;

  // 先压缩图片
  if (compress) {
    try {
      const { tempFilePath } = await wx.compressImage({
        src: filePath,
        quality
      });
      finalPath = tempFilePath;
    } catch (err) {
      console.warn('图片压缩失败，使用原图', err);
    }
  }

  return uploadFile(finalPath, folder);
}

/**
 * 上传多张图片
 * @param {Array<String>} filePaths 本地图片路径数组
 * @param {String} folder 云存储目录
 * @param {Function} onProgress 进度回调 (current, total, fileID)
 * @returns {Promise<Array<String>>} 文件ID数组
 */
async function uploadImages(filePaths, folder = 'images', onProgress) {
  const results = [];
  const total = filePaths.length;

  for (let i = 0; i < filePaths.length; i++) {
    try {
      const fileID = await uploadImage(filePaths[i], folder);
      results.push(fileID);

      if (onProgress) {
        onProgress(i + 1, total, fileID);
      }
    } catch (err) {
      console.error(`上传第${i + 1}张图片失败`, err);
      results.push(null);
    }
  }

  return results;
}

/**
 * 获取文件的临时访问链接
 * @param {String|Array<String>} fileIDs 文件ID或文件ID数组
 * @param {Number} maxAge 链接有效期（秒），默认 1小时
 * @returns {Promise<String|Array<String>>} 临时URL
 */
async function getTempUrl(fileIDs, maxAge = 3600) {
  const isArray = Array.isArray(fileIDs);
  const fileList = isArray ? fileIDs : [fileIDs];

  try {
    const { fileList: resultList } = await wx.cloud.getTempFileURL({
      fileList,
      maxAge
    });

    const urls = resultList.map(item => ({
      fileID: item.fileID,
      tempFileURL: item.tempFileURL,
      status: item.status,
      errMsg: item.errMsg
    }));

    return isArray ? urls : urls[0];
  } catch (err) {
    console.error('获取临时链接失败', err);
    throw err;
  }
}

/**
 * 批量获取临时URL（带缓存）
 * @param {Array<String>} fileIDs 文件ID数组
 * @param {Number} maxAge 有效期（秒）
 * @returns {Promise<Object>} { fileID: tempUrl }
 */
async function getTempUrlMap(fileIDs, maxAge = 3600) {
  if (!fileIDs || fileIDs.length === 0) {
    return {};
  }

  // 去重
  const uniqueFileIDs = [...new Set(fileIDs)].filter(Boolean);

  const urls = await getTempUrl(uniqueFileIDs, maxAge);

  const urlMap = {};
  urls.forEach(item => {
    urlMap[item.fileID] = item.tempFileURL;
  });

  return urlMap;
}

/**
 * 删除云存储文件
 * @param {String|Array<String>} fileIDs 文件ID或文件ID数组
 * @returns {Promise<Object>}
 */
async function deleteFile(fileIDs) {
  const isArray = Array.isArray(fileIDs);
  const fileList = isArray ? fileIDs : [fileIDs];

  try {
    const result = await wx.cloud.deleteFile({
      fileList
    });
    return result;
  } catch (err) {
    console.error('删除文件失败', err);
    throw err;
  }
}

/**
 * 选择图片并上传
 * @param {Object} options 选择图片配置
 * @param {String} folder 上传目录
 * @returns {Promise<Array<String>>} 上传后的文件ID数组
 */
async function chooseAndUploadImages(options = {}, folder = 'images') {
  const {
    count = 9,
    sourceType = ['album', 'camera'],
    compressed = true
  } = options;

  // 选择图片
  const { tempFilePaths } = await wx.chooseMedia({
    count,
    mediaType: ['image'],
    sourceType,
    sizeType: compressed ? ['compressed'] : ['original']
  });

  // 显示上传进度
  wx.showLoading({
    title: `上传 0/${tempFilePaths.length}...`,
    mask: true
  });

  try {
    const results = [];
    for (let i = 0; i < tempFilePaths.length; i++) {
      wx.showLoading({
        title: `上传 ${i + 1}/${tempFilePaths.length}...`,
        mask: true
      });

      const fileID = await uploadImage(tempFilePaths[i], folder);
      results.push(fileID);
    }

    wx.hideLoading();
    return results;
  } catch (err) {
    wx.hideLoading();
    throw err;
  }
}

/**
 * 上传用户头像
 * @param {String} filePath 本地图片路径
 * @returns {Promise<String>} 文件ID
 */
async function uploadAvatar(filePath) {
  return uploadImage(filePath, 'avatars', {
    compress: true,
    quality: 80,
    maxWidth: 256,
    maxHeight: 256
  });
}

/**
 * 上传场馆图片
 * @param {Array<String>} filePaths 本地图片路径数组
 * @returns {Promise<Array<String>>} 文件ID数组
 */
async function uploadVenueImages(filePaths) {
  return uploadImages(filePaths, 'venues', (current, total, fileID) => {
    console.log(`场馆图片上传进度: ${current}/${total}`);
  });
}

module.exports = {
  // 基础方法
  uploadFile,
  uploadImage,
  uploadImages,
  getTempUrl,
  getTempUrlMap,
  deleteFile,

  // 便捷方法
  chooseAndUploadImages,
  uploadAvatar,
  uploadVenueImages
};
