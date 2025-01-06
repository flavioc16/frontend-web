"use client"
import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState, useEffect } from 'react';
import { api } from '@/services/api';
import styles from './page.module.scss';

import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BeatLoader } from 'react-spinners';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/session', {
        username,
        password,
      });

      const { token, role } = response.data;

      if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberedPassword');
      }

      document.cookie = `token=${token}; path=/`;

      localStorage.removeItem('selectedMenuItem');

      if (role === 'ADMIN') {
        localStorage.setItem('selectedMenuItem', '/');
        router.push('/dashboard');
      } else if (role === 'USER') {
        toast.info('Realize o login no nosso APP.');
      } else {
        localStorage.setItem('selectedMenuItem', '/');
        setTimeout(() => {
          router.push('/');
        }, 5000);
      }
    } catch (error) {
      console.error('Erro ao realizar login:', error);
      toast.error('Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  }

  function toggleShowPassword() {
    setShowPassword(!showPassword);
    setTimeout(() => {
      if (passwordInputRef.current) {
        passwordInputRef.current.focus();
        passwordInputRef.current.setSelectionRange(password.length, password.length);
      }
    }, 0);
  }

  return (
    <>
      <div className={`${styles.containerCenter} ${isLoading ? styles.loading : ''}`}>
        <Image
          src="/LOGOVERTICAL.png"
          alt="Logo Frigorifico"
          width={443}
          height={169}
          className={styles.logo}
          priority={true}
          unoptimized={true}
        />

        <section className={styles.login}>
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputContainer}>
              <input
                type="text"
                autoFocus
                required
                name="username"
                placeholder="Usuário"
                className={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <User className={styles.icon} />
            </div>

            <div className={styles.inputContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                name="password"
                placeholder="Senha"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                ref={passwordInputRef}
              />
              {password === '' ? (
                <Lock className={styles.icon} onClick={() => passwordInputRef.current?.focus()} />
              ) : showPassword ? (
                <Eye className={styles.icon} onClick={toggleShowPassword} />
              ) : (
                <EyeOff className={styles.icon} onClick={toggleShowPassword} />
              )}
            </div>

            <div className={styles.rememberMeContainer}>
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <div className={styles.rememberMeText}>
                  Lembrar-me
                </div>
              </label>
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? <BeatLoader color="#fff" size={6} /> : 'Entrar'}
            </button>
          </form>
        </section>
      </div>

      <ToastContainer />
    </>
  );
}
