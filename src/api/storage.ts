// src/api/storage.ts
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function uploadImages(files: File[], bucket: string = 'trade_images'): Promise<string[]> {
    const urls: string[] = [];

    for (const file of files) {
        // Tạo tên file duy nhất để tránh trùng lặp
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw new Error(`Failed to upload ${file.name}`);
        }

        // Lấy public URL
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        urls.push(data.publicUrl);
    }

    return urls;
}
