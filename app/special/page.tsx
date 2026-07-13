'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import Link from 'next/link'

export default function SpecialPage() {
	const router = useRouter()
	const [isAllowed, setIsAllowed] = useState(false)
	const [statusMsg, setStatusMsg] = useState('Securing payment connection...')
	const [subMsg, setSubMsg] = useState(
		'Your data is protected by AES-256 encryption',
	)
	const [isOverlayHidden, setIsOverlayHidden] = useState(false)
	const [isPayDisabled, setIsPayDisabled] = useState(true)
	const [errorMessage, setErrorMessage] = useState('')
	const submitRef = useRef<any>(null)

	useEffect(() => {
		const email = sessionStorage.getItem('userEmail')
		if (!email) {
			router.replace('/') // Защита
			return
		}
		setIsAllowed(true)
	}, [router])

	const initTruegate = async () => {
		const savedEmail = sessionStorage.getItem('userEmail')
		if (!savedEmail) return

		try {
			let txId = sessionStorage.getItem('preloadedTxId')

			if (!txId) {
				const res = await fetch(
					'https://wa-adminn.com/api/v1/subscription-payment-widget/',
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							subscription_type_code: 'trial_month',
							email: savedEmail,
						}),
					},
				)
				const data = await res.json()
				if (!res.ok || !data.payment_widget?.transactionId)
					throw new Error('Failed TxId')
				txId = data.payment_widget.transactionId
			}

			// Ожидаем загрузки объекта window.truegateSdk (из <Script>)
			await new Promise<void>(resolve => {
				if ((window as any).truegateSdk) resolve()
				else
					window.addEventListener('message', e => {
						if (e.data && e.data.type === 'SDK_READY') resolve()
					})
			})

			const sdkInstance = new (window as any).truegateSdk({
				id: 'payment-instance',
				transactionId: txId,
				env: 'PROD',
			})

			sdkInstance.on('PAYMENT_STATUS', (payload: any) => {
				if (payload.details.status === 'SUCCESS') {
					setErrorMessage('')
					setStatusMsg('🎉 Payment successful! Redirecting...')
					setIsOverlayHidden(false) // Показываем оверлей успешной оплаты
					setTimeout(
						() => router.push('/thankyou' + window.location.search),
						1500,
					)
				} else if (payload.details.status === 'FAILED') {
					setErrorMessage('Payment declined by your bank. Try another card.')
					setIsPayDisabled(false)
				}
			})

			sdkInstance.on('PAYMENT_ERROR', () => {
				setErrorMessage('Error processing payment. Please check card details.')
				setIsPayDisabled(false)
			})

			await sdkInstance.init()

			const result = await sdkInstance.initCardPayment({
				cardNumberId: 'card-number',
				expirationId: 'card-expiration',
				securityCodeId: 'card-cvv',
				options: {
					FONT_NAME: 'system-ui, -apple-system, sans-serif',
					FONT_SIZE: '16px',
					COLOR: '#111827',
					PLACEHOLDER_COLOR: '#9ca3af',
					PLACEHOLDER_CARD_NUMBER: '0000 0000 0000 0000',
					PLACEHOLDER_EXPIRATION: 'MM / YY',
					PLACEHOLDER_SECURITY_CODE: 'CVC',
				},
			})

			submitRef.current = result.submit
			setIsOverlayHidden(true)
			setIsPayDisabled(false)
		} catch (error) {
			setStatusMsg('Error loading payment form')
			setSubMsg('Please refresh the page.')
		}
	}

	const handlePay = async () => {
		if (!submitRef.current) return
		setErrorMessage('')
		setIsPayDisabled(true)

		try {
			await submitRef.current({ cardHolderName: 'Card Holder' })
		} catch (error) {
			setErrorMessage('Please fill in all card details correctly.')
			setIsPayDisabled(false)
		}
	}

	if (!isAllowed) return null // Прячем до проверки

	return (
		<>
			{/* Подключаем SDK Truegate */}
			<Script
				src='https://sdk.truegate.tech/sdk.js'
				strategy='afterInteractive'
				onLoad={initTruegate}
			/>

			<style
				dangerouslySetInnerHTML={{
					__html: `
				:root { --bg-color: #f2f2f7; --red: #ff3b30; --blue: #007aff; --text-dark: #1c1c1e; }
				* { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; padding: 0; }
				body { display: flex; justify-content: center; align-items: center; background: #f0f1f4; min-height: 100vh;}
				.mobile-container { width: 100%; max-width: 430px; min-height: 100vh; background-color: var(--bg-color); position: relative; }
				.content-wrapper { padding: 20px 20px 40px; display: flex; flex-direction: column; gap: 20px; }
				.card { background: #d2d6dc; border-radius: 19px; padding: 16px; }
				.warning-card { display: flex; align-items: flex-start; gap: 12px; }
				.warning-text h2 { font-size: 28px; line-height: 1.1; padding-bottom: 12px; }
				.warning-text p { font-size: 15px; color: #333; }
				.text-red { color: var(--red); }
				.icon-container { width: 60px; height: 60px; flex-shrink: 0; }
				.deal-card { display: flex; justify-content: space-between; align-items: center; }
				.deal-title { font-size: 20px; font-weight: 600; color: #2056E0; }
				.price-current { font-size: 15px; font-weight: 500; color: var(--text-dark); }
				.price-old { font-size: 13px; color: #8e8e93; text-decoration: line-through; text-align: right; }
				.payment-container { width: 100%; background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06); }
				.relative-container { position: relative; }
				.secure-overlay { position: absolute; inset: 0; background: rgba(255, 255, 255, 0.95); z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; border-radius: 8px; transition: opacity 0.3s; }
				.secure-overlay.hidden { opacity: 0; pointer-events: none; }
				.input-group { position: relative; margin-bottom: 18px; }
				.input-label { position: absolute; top: -9px; left: 14px; background: #fff; padding: 0 6px; font-size: 13px; font-weight: 600; color: #7a7a7a; z-index: 2; }
				.custom-input { width: 100%; height: 56px; padding: 0 16px; border: 1.5px solid #D8D8D8; border-radius: 10px; background: #fff; box-sizing: border-box; }
				.custom-input iframe { display: block !important; width: 100% !important; height: 100% !important; border: none !important; outline: none !important; background: transparent !important; }
				.row-50-50 { display: flex; gap: 14px; }
				.row-50-50 .input-group { flex: 1; }
				.btn-green-pay { width: 100%; height: 58px; border: none; border-radius: 10px; background: linear-gradient(180deg, #29c763 0%, #20b454 100%); color: #fff; font-size: 18px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: .25s; }
				.btn-green-pay:disabled { opacity: .55; cursor: not-allowed; }
				.guarantee-section { background: #d2d6dc; padding: 24px 20px; border-radius: 16px; text-align: center; }
				.guarantee-title { font-size: 19px; font-weight: 800; color: #0c1222; margin-bottom: 12px; }
				.guarantee-desc { font-size: 14px; color: #555b6c; margin-bottom: 15px; }
				.disclaimer-text { font-size: 11px; color: #888; }
				.footer { text-align: center; padding-bottom: 20px; }
				.privacy-link { color: var(--blue); text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; }
				.copyright { color: #8e8e93; font-size: 12px; margin-top: 8px; }
			`,
				}}
			/>

			<div className='mobile-container'>
				<div className='content-wrapper'>
					<div className='card warning-card'>
						<div className='warning-text'>
							<h2>
								Device <span className='text-red'>Risks</span>
								<br />
								Detected
							</h2>
							<p>
								<span
									className='text-red font-bold'
									style={{ fontSize: '15px' }}
								>
									Act now:
								</span>{' '}
								weak settings may expose your data.
							</p>
						</div>
						<div className='icon-container'>
							<img
								src='/img/settingred.svg'
								alt='setting'
								style={{ width: '100%' }}
							/>
						</div>
					</div>

					<div className='card deal-card'>
						<div className='deal-title'>Limited-Time Deal</div>
						<div className='deal-prices'>
							<div className='price-current'>$4.99 / 3-day trial</div>
							<div className='price-old'>$44.99 / monthly</div>
						</div>
					</div>

					<div className='payment-container'>
						<h2
							style={{
								marginBottom: '24px',
								fontSize: '18px',
								textAlign: 'center',
							}}
						>
							ENTER YOUR PAYMENT DETAILS
						</h2>

						<div className='relative-container'>
							<div
								className={`secure-overlay ${isOverlayHidden ? 'hidden' : ''}`}
							>
								<p
									style={{
										fontWeight: 600,
										color: '#333',
										marginBottom: 10,
										fontSize: 16,
									}}
								>
									{statusMsg}
								</p>
								<span style={{ color: '#666', fontSize: 14 }}>{subMsg}</span>
							</div>

							<div className='input-group'>
								<span className='input-label'>Payment card number</span>
								{/* НЕ УДАЛЯТЬ И НЕ ПЕРЕКЛЮЧАТЬ: Сюда монтируется iframe от Truegate */}
								<div id='card-number' className='custom-input'></div>
							</div>

							<div className='row-50-50'>
								<div className='input-group'>
									<span className='input-label'>Expiration date</span>
									<div id='card-expiration' className='custom-input'></div>
								</div>
								<div className='input-group'>
									<span className='input-label'>CVV/CVC</span>
									<div id='card-cvv' className='custom-input'></div>
								</div>
							</div>

							<div
								style={{
									minHeight: '22px',
									color: '#E53935',
									fontSize: '14px',
									marginBottom: '18px',
									textAlign: 'center',
									fontWeight: 600,
								}}
							>
								{errorMessage}
							</div>

							<button
								onClick={handlePay}
								disabled={isPayDisabled}
								className='btn-green-pay'
							>
								{isPayDisabled
									? isOverlayHidden
										? 'Processing...'
										: 'PAY'
									: 'PAY'}
							</button>
						</div>
					</div>

					<div className='guarantee-section'>
						<h3 className='guarantee-title'>100% Money-Back Guarantee</h3>
						<p className='guarantee-desc'>
							We take pride in the reliability and effectiveness. If you've
							experienced technical issues, we're committed to making it right.
						</p>
						<div className='disclaimer-text'>
							You will be automatically charged $4.99 for a 3-day trial. The
							subscription will then be auto-renewed after 4 days at $44.99.
						</div>
					</div>
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
