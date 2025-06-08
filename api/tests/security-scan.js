#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Security Scan...\n');

class SecurityScanner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      issues: []
    };
  }

  scan() {
    this.checkPackageVulnerabilities();
    this.checkHardcodedSecrets();
    this.checkSecurityHeaders();
    this.checkFilePermissions();
    this.checkEnvironmentFiles();
    this.checkDependencyVersions();
    this.generateReport();
  }

  checkPackageVulnerabilities() {
    console.log('📦 Checking package vulnerabilities...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const vulnerableDeps = [
        'lodash',
        'moment',
        'request',
        'node-uuid'
      ];
      
      const foundVulnerable = [];
      Object.keys(packageJson.dependencies || {}).forEach(dep => {
        if (vulnerableDeps.includes(dep)) {
          foundVulnerable.push(dep);
        }
      });
      
      if (foundVulnerable.length > 0) {
        this.addIssue('high', 'Vulnerable Dependencies', 
          `Found potentially vulnerable dependencies: ${foundVulnerable.join(', ')}`);
      } else {
        this.passed('No known vulnerable dependencies found');
      }
    } catch (error) {
      this.addIssue('medium', 'Package Check Failed', error.message);
    }
  }

  checkHardcodedSecrets() {
    console.log('🔐 Checking for hardcoded secrets...');
    
    const secretPatterns = [
      /(?:password|passwd|pwd)\s*[:=]\s*["'](?![\s*])[^"']{3,}["']/i,
      /(?:secret|key|token)\s*[:=]\s*["'][^"']{10,}["']/i,
      /(?:api[_-]?key)\s*[:=]\s*["'][^"']{10,}["']/i,
      /(?:access[_-]?token)\s*[:=]\s*["'][^"']{10,}["']/i,
      /jwt[_-]?secret\s*[:=]\s*["'][^"']{10,}["']/i
    ];
    
    const excludePatterns = [
      /test[_-]?secret/i,
      /example[_-]?key/i,
      /demo[_-]?password/i,
      /placeholder/i,
      /your[_-]?secret/i
    ];
    
    const filesToCheck = this.getSourceFiles();
    let secretsFound = 0;
    
    filesToCheck.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          secretPatterns.forEach(pattern => {
            if (pattern.test(line) && !excludePatterns.some(exclude => exclude.test(line))) {
              this.addIssue('high', 'Potential Hardcoded Secret', 
                `${file}:${index + 1} - ${line.trim()}`);
              secretsFound++;
            }
          });
        });
      } catch (error) {
        // Skip files that can't be read
      }
    });
    
    if (secretsFound === 0) {
      this.passed('No hardcoded secrets detected');
    }
  }

  checkSecurityHeaders() {
    console.log('🛡️  Checking security headers configuration...');
    
    const securityFiles = [
      'middleware/security.middleware.ts',
      'app-secured.ts'
    ];
    
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'strict-transport-security'
    ];
    
    let headersConfigured = false;
    
    securityFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const foundHeaders = requiredHeaders.filter(header => 
          content.toLowerCase().includes(header.toLowerCase())
        );
        
        if (foundHeaders.length >= 3) {
          headersConfigured = true;
        }
      }
    });
    
    if (headersConfigured) {
      this.passed('Security headers are configured');
    } else {
      this.addIssue('medium', 'Missing Security Headers', 
        'Security headers may not be properly configured');
    }
  }

  checkFilePermissions() {
    console.log('📋 Checking file permissions...');
    
    const sensitiveFiles = [
      '.env',
      '.env.production',
      '.env.local',
      'config/database.ts',
      'private.key'
    ];
    
    let permissionIssues = 0;
    
    sensitiveFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          const stats = fs.statSync(file);
          const mode = (stats.mode & parseInt('777', 8)).toString(8);
          
          // Check if file is world-readable (ends with 4, 5, 6, or 7)
          if (['4', '5', '6', '7'].includes(mode.slice(-1))) {
            this.addIssue('medium', 'File Permission Issue', 
              `${file} is world-readable (${mode})`);
            permissionIssues++;
          }
        } catch (error) {
          // Skip if can't check permissions
        }
      }
    });
    
    if (permissionIssues === 0) {
      this.passed('File permissions appear secure');
    }
  }

  checkEnvironmentFiles() {
    console.log('🌍 Checking environment file security...');
    
    const envFiles = ['.env', '.env.local', '.env.production'];
    let envIssues = 0;
    
    envFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for production secrets in development files
        if (file.includes('env') && !file.includes('example')) {
          if (content.includes('prod') || content.includes('live')) {
            this.addIssue('high', 'Production Secrets in Environment File', 
              `${file} may contain production secrets`);
            envIssues++;
          }
        }
        
        // Check for weak secrets
        const weakSecrets = [
          'secret',
          'password',
          '123456',
          'admin',
          'test'
        ];
        
        weakSecrets.forEach(weak => {
          if (content.toLowerCase().includes(weak)) {
            this.addWarning('Weak Secret Detected', 
              `${file} contains potentially weak secret: ${weak}`);
          }
        });
      }
    });
    
    if (envIssues === 0) {
      this.passed('Environment files appear secure');
    }
  }

  checkDependencyVersions() {
    console.log('📊 Checking dependency versions...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const outdatedPackages = [];
      
      // Check for very old versions of critical packages
      const criticalPackages = {
        'express': '4.18.0',
        'jsonwebtoken': '9.0.0',
        'bcryptjs': '2.4.0',
        'helmet': '6.0.0'
      };
      
      Object.entries(criticalPackages).forEach(([pkg, minVersion]) => {
        const currentVersion = packageJson.dependencies?.[pkg];
        if (currentVersion && currentVersion.replace(/[^0-9.]/g, '') < minVersion) {
          outdatedPackages.push(`${pkg} (${currentVersion})`);
        }
      });
      
      if (outdatedPackages.length > 0) {
        this.addIssue('medium', 'Outdated Dependencies', 
          `Consider updating: ${outdatedPackages.join(', ')}`);
      } else {
        this.passed('Dependencies are reasonably up to date');
      }
    } catch (error) {
      this.addWarning('Dependency Check Failed', error.message);
    }
  }

  getSourceFiles() {
    const sourceFiles = [];
    
    const scanDirectory = (dir) => {
      try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            scanDirectory(filePath);
          } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            sourceFiles.push(filePath);
          }
        });
      } catch (error) {
        // Skip directories that can't be read
      }
    };
    
    scanDirectory('.');
    return sourceFiles;
  }

  addIssue(severity, title, description) {
    this.results.issues.push({ severity, title, description });
    if (severity === 'high') {
      this.results.failed++;
    } else {
      this.results.warnings++;
    }
    
    const icon = severity === 'high' ? '❌' : '⚠️';
    console.log(`${icon} ${severity.toUpperCase()}: ${title}`);
    console.log(`   ${description}\n`);
  }

  addWarning(title, description) {
    this.results.warnings++;
    console.log(`⚠️  WARNING: ${title}`);
    console.log(`   ${description}\n`);
  }

  passed(message) {
    this.results.passed++;
    console.log(`✅ ${message}\n`);
  }

  generateReport() {
    console.log('=' .repeat(60));
    console.log('🔍 Security Scan Report');
    console.log('=' .repeat(60));
    console.log(`✅ Passed Checks: ${this.results.passed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`❌ Failed Checks: ${this.results.failed}`);
    console.log(`📊 Total Issues: ${this.results.issues.length}`);
    
    if (this.results.issues.length > 0) {
      console.log('\n🔍 Detailed Issues:');
      this.results.issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
        console.log(`   ${issue.description}`);
      });
    }
    
    const successRate = Math.round(
      (this.results.passed / (this.results.passed + this.results.failed + this.results.warnings)) * 100
    );
    
    console.log(`\n🎯 Security Score: ${successRate}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Security scan failed. Please address high-priority issues.');
      process.exit(1);
    } else if (this.results.warnings > 3) {
      console.log('\n⚠️  Security scan passed with warnings. Consider addressing them.');
      process.exit(0);
    } else {
      console.log('\n✅ Security scan passed successfully!');
      process.exit(0);
    }
  }
}

// Run the security scan
const scanner = new SecurityScanner();
scanner.scan();