#!/usr/bin/env node
// Cross-compiles the NekoC VM server into app/src/main/jniLibs.
// NEKOC_DIR points at a NekoC checkout (default: ../NekoC next to this repo).
import {execFileSync} from 'node:child_process';
import {copyFileSync,existsSync,mkdirSync,readdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const nekoc=path.resolve(process.env.NEKOC_DIR||path.join(root,'../NekoC'));
if(!existsSync(path.join(nekoc,'Cargo.toml')))throw Error(`NekoC checkout not found: ${nekoc} (set NEKOC_DIR)`);
const sdk=process.env.ANDROID_HOME||process.env.ANDROID_SDK_ROOT||path.join(process.env.LOCALAPPDATA||'','Android/Sdk');
const ndkRoot=process.env.ANDROID_NDK_HOME||path.join(sdk,'ndk',existsSync(path.join(sdk,'ndk'))?readdirSync(path.join(sdk,'ndk')).sort().at(-1):'');
const host={win32:'windows-x86_64',darwin:'darwin-x86_64',linux:'linux-x86_64'}[process.platform];
const bin=path.join(ndkRoot,'toolchains/llvm/prebuilt',host,'bin');
const targets=[['aarch64-linux-android','arm64-v8a'],['x86_64-linux-android','x86_64']];
const wanted=process.argv.slice(2);
for(const [target,abi] of targets){
  if(wanted.length&&!wanted.includes(abi))continue;
  const linker=path.join(bin,`${target}26-clang${process.platform==='win32'?'.cmd':''}`);
  if(!existsSync(linker))throw Error(`NDK linker not found: ${linker}`);
  // C dependencies (psm for deep recursion) need the NDK compiler as well as the linker.
  const cc=target.replaceAll('-','_');
  const env={...process.env,CARGO_TARGET_DIR:path.join(nekoc,'target/android'),[`CARGO_TARGET_${target.toUpperCase().replaceAll('-','_')}_LINKER`]:linker,
    [`CC_${cc}`]:linker,[`AR_${cc}`]:path.join(bin,`llvm-ar${process.platform==='win32'?'.exe':''}`)};
  execFileSync('cargo',['build','--release','--bin','web','--target',target],{stdio:'inherit',env,cwd:nekoc});
  const dir=path.join(root,`app/src/main/jniLibs/${abi}`);mkdirSync(dir,{recursive:true});
  // Only files named lib*.so are extracted to the executable native library directory.
  copyFileSync(path.join(nekoc,`target/android/${target}/release/web`),`${dir}/libnekoweb.so`);
  console.log(`${dir}/libnekoweb.so`);
}
