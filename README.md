# nekoc-android

[NekoC](https://github.com/NekoX-Lab/NekoC) 的 Android 客户端（Material 3）。应用以子进程方式启动交叉编译的 NekoC VM 服务（`libnekoweb.so`），再用 WebView 加载本机 loopback 上的播放器。从主仓库的 `android/` 拆分出来，保留了提交历史。

## 构建

需要 Android SDK + NDK、Rust（含 `aarch64-linux-android`、`x86_64-linux-android` target）和一个 NekoC 检出目录：

```sh
git clone https://github.com/NekoX-Lab/NekoC.git
git clone https://github.com/NekoX-Lab/nekoc-android.git
cd nekoc-android
node tools/build-android.mjs          # 交叉编译 VM，写入 app/src/main/jniLibs/
./gradlew assembleRelease
```

`NEKOC_DIR` 可指定 NekoC 检出目录（默认是同级的 `../NekoC`），`ANDROID_NDK_HOME` 可指定 NDK。只构建一个 ABI：`node tools/build-android.mjs arm64-v8a`。

## 许可

MIT，见 [LICENSE](LICENSE)。
