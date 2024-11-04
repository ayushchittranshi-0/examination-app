'use client';

import { Toaster } from 'react-hot-toast';

export function ToasterProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
            <div className='text-xs'>
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#fff',
                            color: '#363636',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.25rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        },
                        success: {
                            style: {
                                background: '#f0fdf4',
                                color: '#166534',
                                border: '1px solid #bbf7d0',
                            },
                        },
                        error: {
                            style: {
                                background: '#fef2f2',
                                color: '#991b1b',
                                border: '1px solid #fecaca',
                            },
                        },
                    }}
                />
            </div>
    </>
  );
}
