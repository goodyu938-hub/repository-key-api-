import { NextResponse } from 'next/server';
import { ADMIN_PATH } from './lib/adminPath.js';

// หลังบ้านเข้าได้เฉพาะ /<ADMIN_PATH> (rewrite ไป app/admin) ส่วน /admin ตรงๆ ตอบ 404
export function middleware(req) {
  const seg = req.nextUrl.pathname.split('/').filter(Boolean);
  if (seg.length === 1 && seg[0].toLowerCase() === ADMIN_PATH) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.rewrite(url);
  }
  if (seg[0] && seg[0].toLowerCase() === 'admin') {
    const url = req.nextUrl.clone();
    url.pathname = '/__not_found__';
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|uploads|favicon.ico|api).*)'] };
