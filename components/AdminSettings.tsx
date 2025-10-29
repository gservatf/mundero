import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/use-toast';
import { useSettings } from '../hooks/useSettings';
import { 
  FiUpload, 
  FiImage, 
  FiType, 
  FiGlobe, 
  FiSave,
  FiRefreshCw,
  FiCheck
} from 'react-icons/fi';

export const AdminSettings: React.FC = () => {
  const { settings, loading, updateBrandingSettings, updateGeneralSettings, uploadImage } = useSettings();
  const { toast } = useToast();
  
  // Estados para logo
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoUploading, setLogoUploading] = useState(false);

  // Estados para favicon
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string>('');
  const [faviconUploading, setFaviconUploading] = useState(false);

  // Estados para configuración general
  const [generalForm, setGeneralForm] = useState({
    title: '',
    welcomePhrase: '',
    tagline: ''
  });
  const [generalSaving, setGeneralSaving] = useState(false);

  React.useEffect(() => {
    if (settings && !loading) {
      setGeneralForm({
        title: settings.general?.title || '',
        welcomePhrase: settings.general?.welcomePhrase || '',
        tagline: settings.general?.tagline || ''
      });
    }
  }, [settings, loading]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.match(/^image\/(png|jpg|jpeg|svg\+xml)$/)) {
        toast({
          title: "Formato no válido",
          description: "Solo se permiten archivos PNG, JPG y SVG",
          variant: "destructive"
        });
        return;
      }

      // Validar tamaño (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El logo debe ser menor a 2MB",
          variant: "destructive"
        });
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.match(/^image\/(png|svg\+xml|x-icon)$/)) {
        toast({
          title: "Formato no válido",
          description: "Solo se permiten archivos PNG, SVG e ICO para favicon",
          variant: "destructive"
        });
        return;
      }

      // Validar tamaño (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El favicon debe ser menor a 2MB",
          variant: "destructive"
        });
        return;
      }

      setFaviconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setFaviconPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    setLogoUploading(true);
    try {
      const logoUrl = await uploadImage(logoFile, 'branding/logos');
      if (logoUrl) {
        const success = await updateBrandingSettings({ logoUrl });
        if (success) {
          toast({
            title: "Logo actualizado",
            description: "El logo se ha aplicado correctamente"
          });
          setLogoFile(null);
          setLogoPreview('');
        } else {
          throw new Error('Error al guardar configuración');
        }
      } else {
        throw new Error('Error al subir imagen');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el logo",
        variant: "destructive"
      });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleFaviconUpload = async () => {
    if (!faviconFile) return;

    setFaviconUploading(true);
    try {
      const faviconUrl = await uploadImage(faviconFile, 'branding/favicons');
      if (faviconUrl) {
        const success = await updateBrandingSettings({ faviconUrl });
        if (success) {
          toast({
            title: "Favicon actualizado",
            description: "El favicon se ha aplicado correctamente"
          });
          setFaviconFile(null);
          setFaviconPreview('');
        } else {
          throw new Error('Error al guardar configuración');
        }
      } else {
        throw new Error('Error al subir imagen');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el favicon",
        variant: "destructive"
      });
    } finally {
      setFaviconUploading(false);
    }
  };

  const handleGeneralSave = async () => {
    setGeneralSaving(true);
    try {
      const success = await updateGeneralSettings(generalForm);
      if (success) {
        toast({
          title: "Configuración guardada",
          description: "Los cambios se han aplicado correctamente"
        });
      } else {
        throw new Error('Error al guardar configuración');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive"
      });
    } finally {
      setGeneralSaving(false);
    }
  };

  const resetLogo = async () => {
    const success = await updateBrandingSettings({ logoUrl: '' });
    if (success) {
      toast({
        title: "Logo restaurado",
        description: "Se ha restaurado el logo original"
      });
    }
  };

  const resetFavicon = async () => {
    const success = await updateBrandingSettings({ faviconUrl: '/favicon.png' });
    if (success) {
      toast({
        title: "Favicon restaurado",
        description: "Se ha restaurado el favicon original"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <FiRefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Panel de Administración</h2>
        <p className="text-gray-600">Personaliza la identidad visual y contenido de MUNDERO Hub</p>
      </div>

      <Tabs defaultValue="branding" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <FiImage className="w-4 h-4" />
            Identidad Visual
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <FiType className="w-4 h-4" />
            Configuración General
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-6">
          {/* Gestión de Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiImage className="w-5 h-5" />
                Gestión de Logo
              </CardTitle>
              <CardDescription>
                Personaliza el logo principal que aparece en toda la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="logo-upload">Subir nuevo logo</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg,image/svg+xml"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <FiUpload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        Arrastra un archivo aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, SVG (máx. 2MB)
                      </p>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Vista previa</Label>
                  <div className="mt-2 border rounded-lg p-6 bg-gray-50 flex items-center justify-center h-32">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Vista previa del logo" 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : settings.branding?.logoUrl ? (
                      <img 
                        src={settings.branding.logoUrl} 
                        alt="Logo actual" 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                        M
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleLogoUpload} 
                  disabled={!logoFile || logoUploading}
                  className="flex items-center gap-2"
                >
                  {logoUploading ? (
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiCheck className="w-4 h-4" />
                  )}
                  Aplicar Logo
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetLogo}
                  disabled={logoUploading}
                >
                  Restaurar Original
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Gestión de Favicon */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiGlobe className="w-5 h-5" />
                Favicon del Hub
              </CardTitle>
              <CardDescription>
                Personaliza el icono que aparece en la pestaña del navegador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="favicon-upload">Subir nuevo favicon</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      id="favicon-upload"
                      type="file"
                      accept="image/png,image/svg+xml,image/x-icon"
                      onChange={handleFaviconFileChange}
                      className="hidden"
                    />
                    <label htmlFor="favicon-upload" className="cursor-pointer">
                      <FiUpload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        Arrastra un archivo aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, SVG, ICO (máx. 2MB) - Recomendado: 32x32px
                      </p>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Vista previa del favicon</Label>
                  <div className="mt-2 border rounded-lg p-6 bg-gray-50 flex items-center justify-center h-32">
                    {faviconPreview ? (
                      <img 
                        src={faviconPreview} 
                        alt="Vista previa del favicon" 
                        className="w-8 h-8 object-contain"
                      />
                    ) : settings.branding?.faviconUrl ? (
                      <img 
                        src={settings.branding.faviconUrl} 
                        alt="Favicon actual" 
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-sm font-bold">
                        M
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleFaviconUpload} 
                  disabled={!faviconFile || faviconUploading}
                  className="flex items-center gap-2"
                >
                  {faviconUploading ? (
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiCheck className="w-4 h-4" />
                  )}
                  Aplicar Favicon
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetFavicon}
                  disabled={faviconUploading}
                >
                  Restaurar Original
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiType className="w-5 h-5" />
                Configuración General
              </CardTitle>
              <CardDescription>
                Personaliza los textos y títulos que aparecen en toda la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="site-title">Título del sitio</Label>
                  <Input
                    id="site-title"
                    value={generalForm.title}
                    onChange={(e) => setGeneralForm({ ...generalForm, title: e.target.value })}
                    placeholder="MUNDERO Hub"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Aparece en la pestaña del navegador y meta tags
                  </p>
                </div>

                <div>
                  <Label htmlFor="welcome-phrase">Frase de bienvenida</Label>
                  <Input
                    id="welcome-phrase"
                    value={generalForm.welcomePhrase}
                    onChange={(e) => setGeneralForm({ ...generalForm, welcomePhrase: e.target.value })}
                    placeholder="Conecta. Accede. Evoluciona."
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Texto destacado en la pantalla de login y dashboard
                  </p>
                </div>

                <div>
                  <Label htmlFor="tagline">Descripción corta / Tagline</Label>
                  <Textarea
                    id="tagline"
                    value={generalForm.tagline}
                    onChange={(e) => setGeneralForm({ ...generalForm, tagline: e.target.value })}
                    placeholder="El hub universal de identidad del Grupo Servat."
                    className="mt-1"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Usado para SEO, Open Graph y descripciones sociales
                  </p>
                </div>
              </div>

              <Separator />

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Vista previa de SEO</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Título:</span> {generalForm.title || 'MUNDERO Hub'}
                  </div>
                  <div>
                    <span className="font-medium">Descripción:</span> {generalForm.tagline || 'El hub universal de identidad del Grupo Servat.'}
                  </div>
                  <div>
                    <span className="font-medium">Frase de bienvenida:</span> {generalForm.welcomePhrase || 'Conecta. Accede. Evoluciona.'}
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleGeneralSave} 
                disabled={generalSaving}
                className="w-full flex items-center justify-center gap-2"
              >
                {generalSaving ? (
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <FiSave className="w-4 h-4" />
                )}
                Guardar Configuración General
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};