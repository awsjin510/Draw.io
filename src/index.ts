#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import { generateDiagram } from './generator/diagram';
import { writeDrawioFile, generateFilename } from './utils/file-writer';

const program = new Command();

program
  .name('aws-diagram')
  .description(
    'AWS 雲端架構圖產生器 — 使用 Claude API 自動產出 draw.io XML 格式的 AWS 架構圖'
  )
  .version('1.0.0');

program
  .argument('<description>', 'AWS 架構需求描述（自然語言）')
  .option('-o, --output <filename>', '輸出檔名（預設自動產生時間戳記名稱）')
  .option(
    '-t, --type <type>',
    '架構類型提示：web-app | serverless | microservices | data-pipeline',
    'web-app'
  )
  .option('-r, --retries <number>', '驗證失敗時的最大重試次數', '2')
  .option('-v, --verbose', '顯示詳細的生成過程', false)
  .option('--no-write', '不寫入檔案，只輸出 XML 到 stdout')
  .action(async (description: string, options) => {
    const verbose: boolean = options.verbose;
    const maxRetries: number = parseInt(options.retries, 10);
    const archType: string = options.type;
    const shouldWrite: boolean = options.write !== false;

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error(
        chalk.red(
          '錯誤：請設定 ANTHROPIC_API_KEY 環境變數。\n' +
            '可複製 .env.example 為 .env 並填入你的 API Key。'
        )
      );
      process.exit(1);
    }

    console.log(chalk.blue('🚀 AWS 架構圖產生器'));
    console.log(chalk.gray(`需求：${description}`));
    console.log(chalk.gray(`架構類型：${archType}`));
    console.log();

    try {
      const progressChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
      let progressIdx = 0;
      let lastProgressTime = Date.now();

      // Show spinner during generation
      const spinner = setInterval(() => {
        if (Date.now() - lastProgressTime > 200) {
          process.stdout.write(
            `\r${chalk.cyan(progressChars[progressIdx % progressChars.length])} 正在生成架構圖...`
          );
          progressIdx++;
          lastProgressTime = Date.now();
        }
      }, 100);

      const result = await generateDiagram(description, {
        verbose,
        maxRetries,
        onProgress: () => {
          lastProgressTime = Date.now();
        },
      });

      clearInterval(spinner);
      process.stdout.write('\r' + ' '.repeat(40) + '\r');

      // Report generation results
      if (result.validationErrors.length > 0) {
        console.log(
          chalk.yellow(
            `⚠️  生成完成，但有 ${result.validationErrors.length} 個驗證問題：`
          )
        );
        for (const err of result.validationErrors) {
          console.log(chalk.yellow(`   - ${err}`));
        }
        console.log();
      } else {
        console.log(chalk.green(`✅ XML 驗證通過`));
      }

      console.log(chalk.gray(`   嘗試次數：${result.attempts}`));
      console.log(chalk.gray(`   XML 大小：${result.xml.length} 字元`));
      console.log();

      if (shouldWrite) {
        const filename = options.output || generateFilename(`aws-${archType}`);
        const outputPath = writeDrawioFile(result.xml, filename);
        console.log(chalk.green(`📁 已儲存至：${outputPath}`));
        console.log(
          chalk.gray('   可直接用 draw.io 桌面版或 diagrams.net 開啟。')
        );
      } else {
        // Output XML to stdout when --no-write is specified
        process.stdout.write(result.xml + '\n');
      }
    } catch (err) {
      const error = err as Error;
      console.error(chalk.red(`\n❌ 生成失敗：${error.message}`));

      if (verbose) {
        console.error(error.stack);
      }

      process.exit(1);
    }
  });

program.parse(process.argv);
