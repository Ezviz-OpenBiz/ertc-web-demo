import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { babel } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dotenv from "rollup-plugin-dotenv";

// https://vitejs.dev/config/
const config = {
  base: './',
  plugins: [
    // 设置环境变量
    dotenv({ cwd: path.resolve(__dirname, './env/') }),
    react({
      babel: {
        plugins: [["@babel/plugin-proposal-decorators", { "version": "2023-05" }]],
        // babelrc: true,
      }
    })
  ]
}
export default defineConfig(config)
