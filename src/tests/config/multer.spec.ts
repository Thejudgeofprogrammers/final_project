import { multerConfig } from '../../config/multer.config';
import { Request } from 'express';

describe('Multer Config', () => {
    it('should configure disk storage correctly', () => {
        const storage = multerConfig.storage;
    
        expect(storage).toBeDefined();
    
        const req = {} as Request;
        const file = { originalname: 'test.jpg' };
        const callback = jest.fn();
    
        storage.getFilename(req, file, callback);
    
        expect(callback).toHaveBeenCalled();
        const filename = callback.mock.calls[0][1];
        expect(filename).toMatch(/^[a-f0-9]{32}\.jpg$/);
    });
    

    it('should limit file size to 5MB', () => {
        expect(multerConfig.limits).toBeDefined();
        expect(multerConfig.limits.fileSize).toBe(5 * 1024 * 1024);
    });
});