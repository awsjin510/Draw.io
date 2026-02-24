#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { generateDiagram } from './generator/diagram.js';
import { listServices } from './api/claude.js';
import { writeDrawioFile } from './utils/file-writer.js';

const program = new Command();

program
  .name('aws-diagram')
  .description('AWS cloud architecture diagram generator using Claude AI')
  .version('1.0.0')
  .argument('<description>', 'Natural language description of the AWS architecture')
  .option('-o, --output <path>', 'Output file path', './output/architecture.drawio')
  .option('-t, --type <type>', 'Architecture type (web-app, serverless, microservices)', 'web-app')
  .option('--list-services', 'List AWS services needed for the architecture')
  .action(async (description: string, options: { output: string; type: string; listServices?: boolean }) => {
    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error(chalk.red('Error: ANTHROPIC_API_KEY environment variable is not set.'));
      console.error(chalk.yellow('Set it with: export ANTHROPIC_API_KEY=your-api-key'));
      process.exit(1);
    }

    // List services mode
    if (options.listServices) {
      const spinner = ora('Analyzing architecture requirements...').start();
      try {
        const result = await listServices(description);
        spinner.succeed('Analysis complete');
        console.log('\n' + chalk.bold('AWS Services needed:'));
        try {
          const services = JSON.parse(result);
          for (const svc of services) {
            console.log(`  ${chalk.cyan('*')} ${chalk.bold(svc.service)}: ${svc.reason}`);
          }
        } catch {
          console.log(result);
        }
      } catch (error: any) {
        spinner.fail('Failed to analyze');
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
      return;
    }

    // Generate diagram mode
    console.log(chalk.bold('\nAWS Architecture Diagram Generator'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(chalk.cyan('Description:'), description);
    console.log(chalk.cyan('Type:'), options.type);
    console.log(chalk.cyan('Output:'), options.output);
    console.log(chalk.gray('─'.repeat(40)) + '\n');

    const spinner = ora('Generating architecture diagram...').start();
    let charCount = 0;

    try {
      const result = await generateDiagram({
        description,
        type: options.type,
        callbacks: {
          onStart: () => {
            spinner.text = 'Claude is generating the architecture diagram...';
          },
          onProgress: (count) => {
            charCount = count;
            spinner.text = `Generating diagram... (${charCount} characters)`;
          },
          onComplete: () => {
            spinner.text = 'Validating generated XML...';
          },
        },
      });

      if (result.valid) {
        spinner.succeed(`Diagram generated successfully (${result.attempts} attempt${result.attempts > 1 ? 's' : ''})`);
      } else {
        spinner.warn(`Diagram generated with validation warnings after ${result.attempts} attempts`);
        console.log(chalk.yellow('\nValidation warnings:'));
        for (const error of result.errors) {
          console.log(chalk.yellow(`  ! ${error}`));
        }
      }

      // Write file
      const outputPath = await writeDrawioFile(result.xml, options.output);
      console.log(chalk.green(`\nDiagram saved to: ${outputPath}`));
      console.log(chalk.gray('Open this file with draw.io desktop or https://app.diagrams.net'));

    } catch (error: any) {
      spinner.fail('Failed to generate diagram');
      console.error(chalk.red(`\nError: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();
