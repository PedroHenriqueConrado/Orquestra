const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const sharp = require('sharp');
const archiver = require('archiver');
const { createWriteStream } = require('fs');

class UploadService {
    constructor() {
        this.uploadDir = path.join(process.cwd(), 'uploads');
        this.compressedDir = path.join(this.uploadDir, 'compressed');
        this.initializeDirectories();
    }

    async initializeDirectories() {
        try {
            await fs.access(this.uploadDir);
            await fs.access(this.compressedDir);
        } catch {
            await fs.mkdir(this.uploadDir, { recursive: true });
            await fs.mkdir(this.compressedDir, { recursive: true });
        }
    }

    generateFileName(originalName) {
        const timestamp = Date.now();
        const hash = crypto.randomBytes(8).toString('hex');
        const ext = path.extname(originalName);
        return `${timestamp}-${hash}${ext}`;
    }

    async compressImage(buffer, options = {}) {
        const { width, height, quality } = {
            width: 1920,
            height: 1080,
            quality: 80,
            ...options
        };

        return await sharp(buffer)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality })
            .toBuffer();
    }

    async compressFile(filePath, originalName) {
        const compressedFileName = this.generateFileName(originalName + '.zip');
        const compressedFilePath = path.join(this.compressedDir, compressedFileName);
        
        return new Promise((resolve, reject) => {
            const output = createWriteStream(compressedFilePath);
            const archive = archiver('zip', {
                zlib: { level: 9 }
            });

            output.on('close', () => {
                resolve({
                    fileName: compressedFileName,
                    filePath: compressedFilePath,
                    size: archive.pointer()
                });
            });

            archive.on('error', reject);
            archive.pipe(output);
            archive.file(filePath, { name: originalName });
            archive.finalize();
        });
    }

    isImage(mimeType) {
        return mimeType.startsWith('image/');
    }

    needsCompression(size) {
        return size > 5 * 1024 * 1024; // 5MB
    }

    async saveFile(file) {
        const fileName = this.generateFileName(file.originalname);
        const filePath = path.join(this.uploadDir, fileName);
        
        // Se for uma imagem grande, comprimir
        if (this.isImage(file.mimetype) && this.needsCompression(file.size)) {
            const compressedBuffer = await this.compressImage(file.buffer);
            await fs.writeFile(filePath, compressedBuffer);
            
            return {
                fileName,
                filePath,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: compressedBuffer.length,
                compressed: true
            };
        }
        
        // Se for um arquivo grande não-imagem, comprimir com zip
        if (!this.isImage(file.mimetype) && this.needsCompression(file.size)) {
            await fs.writeFile(filePath, file.buffer);
            const compressedFile = await this.compressFile(filePath, file.originalname);
            await fs.unlink(filePath); // Remove arquivo original
            
            return {
                fileName: compressedFile.fileName,
                filePath: compressedFile.filePath,
                originalName: file.originalname,
                mimeType: 'application/zip',
                size: compressedFile.size,
                compressed: true
            };
        }
        
        // Arquivo pequeno, salvar normalmente
        await fs.writeFile(filePath, file.buffer);
        return {
            fileName,
            filePath,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            compressed: false
        };
    }

    async saveMultipleFiles(files) {
        return Promise.all(files.map(file => this.saveFile(file)));
    }

    async deleteFile(fileName) {
        const regularPath = path.join(this.uploadDir, fileName);
        const compressedPath = path.join(this.compressedDir, fileName);
        
        try {
            await fs.unlink(regularPath);
            return true;
        } catch (error) {
            if (error.code === 'ENOENT') {
                try {
                    await fs.unlink(compressedPath);
                    return true;
                } catch (innerError) {
                    if (innerError.code === 'ENOENT') {
                        return true; // Arquivo não existe em nenhum diretório
                    }
                    throw innerError;
                }
            }
            throw error;
        }
    }

    getFilePath(fileName) {
        const regularPath = path.join(this.uploadDir, fileName);
        const compressedPath = path.join(this.compressedDir, fileName);
        
        // Verifica qual caminho existe
        return fs.access(regularPath)
            .then(() => regularPath)
            .catch(() => compressedPath);
    }
}

module.exports = new UploadService(); 