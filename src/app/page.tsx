"use client";
import { useEffect } from "react";
import { startSyncPolling, stopSyncPolling } from "../utils/sync-engine";
import ServiceCards from '../components/servicecards';
import { supabase } from '../utils/supabaseClient';
import React from 'react';

export default function HomePage() {
  useEffect(() => {
    startSyncPolling();
    return () => stopSyncPolling();
  }, []);

  React.useEffect(() => {
    supabase.from('materials').select('*').limit(1).then(res => {
      console.log('[SUPABASE 연결 테스트 성공]', res);
    });
  }, []);

  return (
    <main className="flex flex-col justify-center items-center min-h-[70vh]">
      <ServiceCards />
    </main>
  );
}
