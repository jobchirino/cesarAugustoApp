'use client';

import { useState } from 'react';
import { getAuthToken } from '@/lib/api';

interface CierreEscolarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CierreEscolarModal({ isOpen, onClose, onSuccess }: CierreEscolarModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCierre = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/cierre-escolar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error al cerrar el año escolar');
        setLoading(false);
        return;
      }

      if (data.pdf_url) {
        const link = document.createElement('a');
        link.href = data.pdf_url;
        link.download = `egresados_${new Date().getFullYear()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Error de conexión. Intente más tarde.');
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">
              Procesando cierre de año, generando PDFs y limpiando base de datos. Por favor no cierre esta ventana...
            </p>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={!loading ? onClose : undefined}></div>

        <div className="relative bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Cerrar Año Escolar</h2>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-3">
              <strong className="text-red-600">⚠️ Advertencia:</strong> Esta acción es <strong>irreversible</strong> y eliminará las notas y asistencias de todos los estudiantes.
            </p>
            <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
              <li>Se generará un PDF con los estudiantes de 6to grado</li>
              <li>Las notas y asistencias serán eliminadas</li>
              <li>Los estudiantes avanzarán al siguiente grado</li>
              <li>Los estudiantes de 6to grado serán eliminados del sistema</li>
            </ul>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleCierre}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Confirmar Cierre'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
