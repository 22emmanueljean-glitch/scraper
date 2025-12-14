#!/usr/bin/env node

const input = process.argv.slice(2).join(' ');
if (!input) {
  console.log('Usage: scraper <text>');
  process.exit(0);
}

console.log(input.trim());
