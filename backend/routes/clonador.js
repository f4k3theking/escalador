const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Criar pasta downloads se não existir
const ensureDownloadsDir = async () => {
  const downloadsDir = path.join(__dirname, '../downloads');
  try {
    await fs.access(downloadsDir);
  } catch {
    await fs.mkdir(downloadsDir, { recursive: true });
  }
  return downloadsDir;
};

// Limpar arquivos antigos (mais de 1 hora)
const cleanOldFiles = async (downloadsDir) => {
  try {
    const files = await fs.readdir(downloadsDir);
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    for (const file of files) {
      const filePath = path.join(downloadsDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime.getTime() < oneHourAgo) {
        await fs.unlink(filePath);
        console.log(`🗑️ Arquivo antigo removido: ${file}`);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao limpar arquivos antigos:', error);
  }
};

// Limpar arquivos temporários do SaveWeb2Zip (arquivos sem prefixo cloned_page_)
const cleanTempFiles = async (downloadsDir) => {
  try {
    const files = await fs.readdir(downloadsDir);
    
    for (const file of files) {
      // Remover arquivos ZIP que não foram processados pelo nosso sistema
      if (file.endsWith('.zip') && !file.startsWith('cloned_page_')) {
        const filePath = path.join(downloadsDir, file);
        const stats = await fs.stat(filePath);
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        
        // Remover arquivos temporários mais antigos que 5 minutos
        if (stats.mtime.getTime() < fiveMinutesAgo) {
          await fs.unlink(filePath);
          console.log(`🗑️ Arquivo temporário removido: ${file}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro ao limpar arquivos temporários:', error);
  }
};

// Validar URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Rota principal para clonar página usando EXCLUSIVAMENTE SaveWeb2Zip
router.post('/clone-page', async (req, res) => {
  let browser = null;
  
  try {
    const { url } = req.body;
    
    // Validações
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL é obrigatória'
      });
    }
    
    if (!isValidUrl(url)) {
      return res.status(400).json({
        success: false,
        error: 'URL inválida'
      });
    }
    
    console.log(`🚀 Iniciando clonagem da página via SaveWeb2Zip: ${url}`);
    
    // Configurar diretório de downloads
    const downloadsDir = await ensureDownloadsDir();
    await cleanOldFiles(downloadsDir);
    await cleanTempFiles(downloadsDir);
    
    // Registrar arquivos existentes antes do download
    const existingFiles = await fs.readdir(downloadsDir);
    const existingZipFiles = existingFiles.filter(file => file.endsWith('.zip'));
    console.log(`📁 Arquivos ZIP existentes: ${existingZipFiles.length}`);
    
    // Configurar Puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
    });
    
    const page = await browser.newPage();
    
    // Configurar User-Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Configurar viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('📱 Navegando para SaveWeb2Zip...');
    
    // Navegar para SaveWeb2Zip (versão em inglês)
    await page.goto('https://saveweb2zip.com/en', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('✅ SaveWeb2Zip carregado');
    
    // Aguardar a página carregar completamente
    await page.waitForTimeout(5000);
    
    // Baseado no HTML fornecido, vamos procurar o campo de input principal
    // O site tem uma estrutura simples com um input para URL
    let urlInput = null;
    
    // Aguardar o campo de input aparecer
    try {
      await page.waitForSelector('input', { timeout: 10000 });
      console.log('📝 Campo input encontrado, procurando o campo de URL...');
      
      // Procurar por qualquer input visível (o site tem estrutura simples)
      const inputs = await page.$$('input');
      
      for (const input of inputs) {
        const isVisible = await input.isIntersectingViewport();
        const inputType = await input.evaluate(el => el.type || 'text');
        const placeholder = await input.evaluate(el => el.placeholder || '');
        
        console.log(`🔍 Input encontrado: tipo=${inputType}, placeholder="${placeholder}", visível=${isVisible}`);
        
        // Aceitar qualquer input visível (o SaveWeb2Zip tem apenas um campo principal)
        if (isVisible) {
          urlInput = input;
          console.log(`📝 Usando campo de input: tipo=${inputType}, placeholder="${placeholder}"`);
          break;
        }
      }
    } catch (e) {
      console.log('❌ Erro ao aguardar input:', e.message);
    }
    
    if (!urlInput) {
      // Fazer screenshot para debug
      await page.screenshot({ path: path.join(downloadsDir, 'debug-saveweb2zip.png') });
      
      // Tentar encontrar qualquer elemento que aceite texto
      try {
        urlInput = await page.$('input');
        if (urlInput) {
          console.log('📝 Usando primeiro input encontrado como fallback');
        }
      } catch (e) {
        console.log('❌ Nenhum input encontrado');
      }
    }
    
    if (!urlInput) {
      throw new Error('Campo de URL não encontrado no SaveWeb2Zip. Screenshot salvo para debug.');
    }
    
    // Limpar e preencher o campo
    await urlInput.click({ clickCount: 3 });
    await urlInput.type(url);
    
    console.log(`📝 URL inserida: ${url}`);
    
    // Procurar o botão "Save" baseado no HTML do SaveWeb2Zip
    console.log('🔍 Procurando botão "Save"...');
    
    let downloadButton = null;
    
    // Aguardar botão aparecer
    try {
      await page.waitForSelector('button', { timeout: 5000 });
      console.log('📝 Botões encontrados, procurando o botão "Save"...');
    } catch (e) {
      console.log('⚠️ Nenhum botão encontrado inicialmente');
    }
    
    // Primeira tentativa: procurar por texto "Save"
    try {
      downloadButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], [role="button"], div[role="button"]'));
        return buttons.find(btn => {
          const text = (btn.textContent || btn.value || '').toLowerCase().trim();
          return text.includes('save') || 
                 text.includes('download') ||
                 text.includes('generate') ||
                 text.includes('create');
        });
      });
      
      if (downloadButton && await downloadButton.asElement()) {
        console.log('🔘 Botão "Save" encontrado por texto');
      } else {
        downloadButton = null;
      }
    } catch (e) {
      console.log('❌ Erro ao procurar botão por texto:', e.message);
    }
    
    // Segunda tentativa: qualquer botão visível
    if (!downloadButton) {
      console.log('🔍 Procurando qualquer botão visível...');
      const allButtons = await page.$$('button, input[type="submit"], [role="button"]');
      
      for (const button of allButtons) {
        const isVisible = await button.isIntersectingViewport();
        const text = await button.evaluate(el => (el.textContent || el.value || '').trim());
        
        console.log(`🔍 Botão encontrado: texto="${text}", visível=${isVisible}`);
        
        if (isVisible) {
          downloadButton = button;
          console.log(`🔘 Usando botão visível: "${text}"`);
          break;
        }
      }
    }
    
    // Terceira tentativa: pressionar Enter no campo de input
    if (!downloadButton) {
      console.log('🔍 Tentando pressionar Enter no campo de input...');
      try {
        await urlInput.press('Enter');
        console.log('⌨️ Enter pressionado no campo de input');
        
        // Aguardar um pouco para ver se algo acontece
        await page.waitForTimeout(3000);
        
        // Marcar como se tivesse encontrado o botão para continuar
        downloadButton = true;
      } catch (e) {
        console.log('❌ Erro ao pressionar Enter:', e.message);
      }
    }
    
    if (!downloadButton) {
      // Fazer screenshot para debug
      await page.screenshot({ path: path.join(downloadsDir, 'debug-no-button.png') });
      throw new Error('Botão "Save" não encontrado no SaveWeb2Zip. Screenshot salvo para debug.');
    }
    
    // Configurar interceptação de downloads
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadsDir
    });
    
    console.log('⬇️ Iniciando processo de download...');
    
    // Clicar no botão de download (se não foi Enter)
    if (downloadButton !== true) {
      try {
        await downloadButton.click();
        console.log('🔘 Botão clicado');
      } catch (e) {
        console.log('⚠️ Erro ao clicar no botão, tentando Enter...', e.message);
        await urlInput.press('Enter');
      }
    }
    
    // Aguardar o processo iniciar
    await page.waitForTimeout(5000);
    
    // Aguardar o arquivo ser baixado (máximo 2 minutos)
    const maxWaitTime = 120000; // 2 minutos
    const checkInterval = 1000; // 1 segundo
    let waitTime = 0;
    let downloadedFile = null;
    
    while (waitTime < maxWaitTime) {
      try {
        const files = await fs.readdir(downloadsDir);
        const zipFiles = files.filter(file => file.endsWith('.zip'));
        
        // Procurar apenas por arquivos novos (que não existiam antes)
        const newZipFiles = zipFiles.filter(file => !existingZipFiles.includes(file));
        
        if (newZipFiles.length > 0) {
          // Verificar se o arquivo não está sendo escrito (tamanho estável)
          const latestFile = newZipFiles[newZipFiles.length - 1];
          const filePath = path.join(downloadsDir, latestFile);
          
          const stats1 = await fs.stat(filePath);
          await page.waitForTimeout(1000);
          const stats2 = await fs.stat(filePath);
          
          if (stats1.size === stats2.size && stats1.size > 0) {
            downloadedFile = latestFile;
            console.log(`✅ Novo arquivo baixado: ${downloadedFile} (${stats1.size} bytes)`);
            break;
          }
        } else if (zipFiles.length > existingZipFiles.length) {
          // Caso alternativo: se há mais arquivos ZIP que antes
          console.log(`📥 Detectado ${zipFiles.length - existingZipFiles.length} novo(s) arquivo(s)`);
        }
      } catch (error) {
        // Continuar tentando
      }
      
      await page.waitForTimeout(checkInterval);
      waitTime += checkInterval;
    }
    
    if (!downloadedFile) {
      throw new Error('Timeout: Download não foi concluído em 2 minutos');
    }
    
    // Renomear arquivo com ID único
    const fileId = uuidv4();
    const originalPath = path.join(downloadsDir, downloadedFile);
    const newFileName = `cloned_page_${fileId}.zip`;
    const newPath = path.join(downloadsDir, newFileName);
    
    await fs.rename(originalPath, newPath);
    
    console.log(`✅ Página clonada com sucesso!`);
    console.log(`📄 URL original: ${url}`);
    console.log(`📁 Arquivo original: ${downloadedFile}`);
    console.log(`🆔 Novo arquivo: ${newFileName}`);
    console.log(`🔗 File ID: ${fileId}`);
    
    res.json({
      success: true,
      message: 'Página clonada com sucesso!',
      data: {
        fileId: fileId,
        fileName: newFileName,
        originalUrl: url,
        downloadUrl: `/api/clonador/download/${fileId}`,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao clonar página:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha ao clonar a página'
    });
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Rota para download do arquivo
router.get('/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    console.log(`📥 Download solicitado para ID: ${fileId}`);
    
    const downloadsDir = await ensureDownloadsDir();
    const fileName = `cloned_page_${fileId}.zip`;
    const filePath = path.join(downloadsDir, fileName);
    
    console.log(`📁 Procurando arquivo: ${filePath}`);
    
    // Verificar se arquivo existe
    try {
      await fs.access(filePath);
      const stats = await fs.stat(filePath);
      console.log(`✅ Arquivo encontrado: ${fileName} (${stats.size} bytes)`);
    } catch (error) {
      console.log(`❌ Arquivo não encontrado: ${fileName}`);
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado ou expirado'
      });
    }
    
    // Configurar headers para download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', (await fs.stat(filePath)).size);
    
    console.log(`📤 Enviando arquivo: ${fileName}`);
    
    // Enviar arquivo
    res.sendFile(path.resolve(filePath), (err) => {
      if (err) {
        console.error('❌ Erro ao enviar arquivo:', err);
      } else {
        console.log(`✅ Arquivo enviado com sucesso: ${fileName}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao processar download:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para listar downloads disponíveis
router.get('/downloads', async (req, res) => {
  try {
    const downloadsDir = await ensureDownloadsDir();
    await cleanOldFiles(downloadsDir);
    
    const files = await fs.readdir(downloadsDir);
    const zipFiles = files.filter(file => file.endsWith('.zip'));
    
    const fileList = await Promise.all(
      zipFiles.map(async (file) => {
        const filePath = path.join(downloadsDir, file);
        const stats = await fs.stat(filePath);
        const fileId = file.replace('cloned_page_', '').replace('.zip', '');
        
        return {
          fileId,
          fileName: file,
          size: stats.size,
          createdAt: stats.birthtime,
          downloadUrl: `/api/clonador/download/${fileId}`
        };
      })
    );
    
    res.json({
      success: true,
      files: fileList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    });
    
  } catch (error) {
    console.error('❌ Erro ao listar downloads:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar downloads'
    });
  }
});

// Rota para deletar arquivo
router.delete('/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const downloadsDir = await ensureDownloadsDir();
    const fileName = `cloned_page_${fileId}.zip`;
    const filePath = path.join(downloadsDir, fileName);
    
    await fs.unlink(filePath);
    
    res.json({
      success: true,
      message: 'Arquivo deletado com sucesso'
    });
    
    console.log(`🗑️ Arquivo deletado: ${fileName}`);
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado'
      });
    }
    
    console.error('❌ Erro ao deletar arquivo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar arquivo'
    });
  }
});

// Rota de debug para verificar arquivos no diretório
router.get('/debug/files', async (req, res) => {
  try {
    const downloadsDir = await ensureDownloadsDir();
    const files = await fs.readdir(downloadsDir);
    
    const fileDetails = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(downloadsDir, file);
        const stats = await fs.stat(filePath);
        
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          isProcessed: file.startsWith('cloned_page_'),
          extension: path.extname(file)
        };
      })
    );
    
    res.json({
      success: true,
      directory: downloadsDir,
      totalFiles: files.length,
      zipFiles: files.filter(f => f.endsWith('.zip')).length,
      processedFiles: files.filter(f => f.startsWith('cloned_page_')).length,
      files: fileDetails.sort((a, b) => new Date(b.modified) - new Date(a.modified))
    });
    
  } catch (error) {
    console.error('❌ Erro ao listar arquivos de debug:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar arquivos'
    });
  }
});

module.exports = router;
