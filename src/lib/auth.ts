import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "./supabase/server";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        id: { label: "아이디", type: "text" },
        password: { label: "비밀번호", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log("인증 시도:", credentials?.id);
          
          // 실제 프로젝트에서는 DB 조회 등으로 대체해야 합니다
          const users = [
              { 
                uuid: "00000000-0000-0000-0000-000000000000", // DB와 동일하게 수정
                id: "admin", // 로그인용 ID
                password: "admin1234", 
                name: "관리자", 
                email: "admin@example.com", 
                role: "admin" 
              },
              { 
                uuid: "6ba7b810-9dad-11d1-80b4-00c04fd430c8", // 실제 UUID
                id: "user", // 로그인용 ID
                password: "user1234", 
                name: "일반사용자", 
                email: "user@example.com", 
                role: "user" 
              }
          ];
          
          const user = users.find(user => 
            user.id === credentials?.id && 
            user.password === credentials?.password
          );
          
          if (user) {
            // 반드시 uuid가 반환되는지 명확하게 로그
            const resultUser = {
              id: user.uuid, // 반드시 uuid!
              name: user.name,
              email: user.email,
              role: user.role
            };
            console.log("authorize 최종 반환:", resultUser);
            return resultUser;
          }
          
          console.log("인증 실패: 사용자 정보 불일치");
          return null;
        } catch (error) {
          console.error("인증 처리 중 오류 발생:", error);
        return null;
        }
      }
    }),
    // 제공자를 여기에 추가할 수 있습니다.
  ],
  pages: {
    signIn: "/auth/login-idpw",
    // signOut: '/auth/signout',
    // error: '/auth/error',
    // verifyRequest: '/auth/verify-request',
    // newUser: '/auth/new-user'
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        console.log('세션 콜백 - session.user.id:', session.user.id);
        console.log('세션 콜백 - token.sub:', token.sub);
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        console.log('jwt 콜백 - user.id:', user.id);
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1일
    updateAge: 24 * 60 * 60, // 1일마다 세션 갱신
  },
  events: {
    signOut: async () => {
      console.log("로그아웃 이벤트 발생 - 세션 제거");
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your-nextauth-secret",
  debug: process.env.NODE_ENV === "development",
  jwt: {
    maxAge: 24 * 60 * 60, // 1일
  },
};

// 타입 확장
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
    };
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}
