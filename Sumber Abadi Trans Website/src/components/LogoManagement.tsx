import { useState, useEffect } from 'react';
import { Image, Upload, Save, X } from 'lucide-react';
import logoImage from 'figma:asset/eb1bd1e163b2c0edcf2bc9e05fae5d6d51d8a290.png';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function LogoManagement() {
  const [currentLogo, setCurrentLogo] = useState(logoImage);
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-556a53e9/settings/logo`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.logoUrl) {
          setCurrentLogo(data.logoUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar (PNG, JPG, atau SVG)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }

      setNewLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!newLogoFile) {
      alert('Mohon pilih file logo terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-556a53e9/settings/logo`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({ logoUrl: base64Image })
          }
        );

        if (response.ok) {
          setCurrentLogo(base64Image);
          setIsEditing(false);
          setNewLogoFile(null);
          setPreviewUrl('');
          alert('Logo berhasil diupdate');
        } else {
          alert('Gagal mengupdate logo');
        }
        setLoading(false);
      };
      reader.readAsDataURL(newLogoFile);
    } catch (error) {
      console.error('Error updating logo:', error);
      alert('Terjadi kesalahan saat mengupdate logo');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewLogoFile(null);
    setPreviewUrl('');
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-gray-900 flex items-center gap-2">
          <Image className="w-5 h-5 text-blue-600" />
          Manajemen Logo Perusahaan
        </h3>
      </div>

      <div className="space-y-6">
        {/* Current Logo */}
        <div>
          <label className="block text-gray-700 mb-3">Logo Saat Ini</label>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex justify-center items-center">
            <img 
              src={currentLogo} 
              alt="Current Logo" 
              className="max-h-32 w-auto object-contain"
              style={{ mixBlendMode: 'multiply' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = logoImage;
              }}
            />
          </div>
        </div>

        {isEditing ? (
          <>
            {/* File Upload Input */}
            <div>
              <label className="block text-gray-700 mb-2">
                Upload Logo Baru <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-600">
                      {newLogoFile ? newLogoFile.name : 'Pilih file gambar...'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                Format yang didukung: PNG, JPG, JPEG, SVG (Maksimal 5MB)
              </p>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div>
                <label className="block text-gray-700 mb-3">Preview Logo Baru</label>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex justify-center items-center">
                  <img 
                    src={previewUrl} 
                    alt="Preview Logo" 
                    className="max-h-32 w-auto object-contain"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={loading || !newLogoFile}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Menyimpan...' : 'Simpan Logo'}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Batal
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Ubah Logo
          </button>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-gray-900 mb-2">Panduan Upload Logo:</h4>
          <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
            <li>Pilih file gambar dari device Anda</li>
            <li>Format yang didukung: PNG, JPG, JPEG, SVG</li>
            <li>Ukuran file maksimal: 5MB</li>
            <li>Rasio aspek yang disarankan: 16:9 atau persegi</li>
            <li>Untuk hasil terbaik, gunakan background transparan (PNG)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}