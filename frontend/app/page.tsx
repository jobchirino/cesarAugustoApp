'use client'
import api from '@/lib/api';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  api.get('/users/any-registered')
    .then(response => {
      if (response.data.registered) {
        console.log('Usuario registrado:', response.data.registered);
        router.push('/login');
      } else {
        router.push('/register');
      }
    })
    .catch(() => {
      router.push('/login');
    }).finally(() => {
      setLoading(false);
    }); 

  return(
    loading ? <div className="min-h-screen flex items-center justify-center bg-primary-800">Cargando...</div> : null
  )
}
