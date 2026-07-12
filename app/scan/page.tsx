'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const logsData = [
	{
		type: 'error',
		code: '184726',
		desc: 'auth_session_expired while validating cached credentials',
	},
	{
		type: 'error',
		code: '672940',
		desc: 'api_gateway_timeout upstream service did not respond',
	},
	{
		type: 'warning',
		code: '149285',
		desc: 'service_health_probe returned degraded status',
	},
	{
		type: 'success',
		code: '781204',
		desc: 'auth_session_restore completed without conflicts',
	},
	{
		type: 'error',
		code: '438219',
		desc: 'database_write_failed constraint violation on user_state',
	},
	{
		type: 'error',
		code: '590318',
		desc: 'config_reload_failed malformed environment override',
	},
	{
		type: 'error',
		code: '826104',
		desc: 'cache_index_corrupted checksum validation failed',
	},
	{
		type: 'warning',
		code: '902347',
		desc: 'ui_render_queue skipped delayed frame update',
	},
	{
		type: 'error',
		code: '305771',
		desc: 'message_queue_overflow dropped pending sync events',
	},
	{
		type: 'error',
		code: '947260',
		desc: 'permission_scope_mismatch requested token lacks required grant',
	},
	{
		type: 'warning',
		code: '612804',
		desc: 'retry_policy_triggered after unstable endpoint response',
	},
	{
		type: 'error',
		code: '218604',
		desc: 'storage_volume_full unable to persist diagnostic snapshot',
	},
	{
		type: 'error',
		code: '763915',
		desc: 'ssl_certificate_expired secure channel negotiation failed',
	},
	{
		type: 'success',
		code: '845601',
		desc: 'file_descriptor_cleanup released inactive handles',
	},
	{
		type: 'error',
		code: '409582',
		desc: 'worker_thread_crashed unhandled exception in task executor',
	},
]

export default function ScanPage() {
	const router = useRouter()
	const [progress, setProgress] = useState(0)
	const [visibleLogs, setVisibleLogs] = useState<typeof logsData>([])
	const [isComplete, setIsComplete] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const scanDuration = 3000
		const updateInterval = 50
		const step = 100 / (scanDuration / updateInterval)
		let currentProgress = 0

		const timer = setInterval(() => {
			currentProgress += step
			if (currentProgress >= 100) {
				currentProgress = 100
				clearInterval(timer)
				setTimeout(() => setIsComplete(true), 500)
			}

			setProgress(currentProgress)
			const targetLogsCount = Math.floor(
				(currentProgress / 100) * logsData.length,
			)
			setVisibleLogs(logsData.slice(0, targetLogsCount))

			if (containerRef.current) {
				containerRef.current.scrollTop = containerRef.current.scrollHeight
			}
		}, updateInterval)

		return () => clearInterval(timer)
	}, [])

	// Сохраняем квери параметры для следующей страницы
	const specialUrl =
		typeof window !== 'undefined'
			? `/special${window.location.search}`
			: '/special'

	return (
		<>
			<style
				dangerouslySetInnerHTML={{
					__html: `
				:root { --bg-color: #f4f4f7; --blue: #007aff; --red: #ff3b30; --orange: #ff9500; --green: #34c759; --gray-text: #8e8e93; }
				* { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
				body { display: flex; justify-content: center; align-items: center; background: #f0f1f4; min-height: 100vh;}
				.mobile-container { width: 100%; max-width: 430px; height: 100vh; background-color: var(--bg-color); display: flex; flex-direction: column; overflow: hidden; }
				.header-section { padding: 30px 20px 5px; text-align: center; }
				.page-title { font-size: 18px; font-weight: 700; color: #333; margin: 0 0 5px; }
				.page-subtitle { font-size: 14px; color: #555; }
				.progress-box { background: #fff; margin: 15px 20px; padding: 12px 20px; border-radius: 20px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03); }
				.progress-track { flex: 1; background-color: #e5e5ea; height: 10px; border-radius: 5px; overflow: hidden; }
				.progress-fill { background-color: var(--red); height: 10px; border-radius: 5px; transition: width 0.1s linear; }
				.progress-percent { color: var(--red); font-weight: 700; font-size: 16px; min-width: 45px; text-align: right; }
				.logs-container { flex: 1; padding: 0 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
				.logs-container::-webkit-scrollbar { width: 0px; }
				.log-item { background: #fff; border-radius: 12px; padding: 12px 15px; display: flex; align-items: flex-start; gap: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); animation: fadeIn 0.3s ease-out forwards; }
				@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
				.log-item.error { border-left: 3px solid var(--red); }
				.log-item.warning { border-left: 3px solid var(--orange); }
				.log-item.success { border-left: 3px solid var(--green); }
				.log-icon { width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px; }
				.log-code { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 2px; }
				.log-desc { font-size: 11px; color: var(--gray-text); line-height: 1.2; }
				.bottom-section { padding: 0 20px; }
				.scan-banner { background: #000; border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
				.banner-title { color: var(--red); font-size: 16px; font-weight: 700; }
				.banner-sub { color: #8e8e93; font-size: 11px; margin-top: 2px; }
				.critical-banner { background: var(--red); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 10px; color: white; font-size: 22px; font-weight: 700; margin-bottom: 10px; }
				.stats-cards { display: flex; gap: 10px; margin-bottom: 15px; }
				.stat-card { flex: 1; background: #fff; border-radius: 12px; padding: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
				.stat-num { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
				.stat-label { font-size: 11px; color: #333; font-weight: 500; }
				.action-btn { display: flex; justify-content: center; background-color: var(--blue); color: white; border: none; border-radius: 25px; padding: 14px; font-size: 18px; text-decoration: none; font-weight: 600; width: 100%; transition: 0.3s; margin-bottom: 20px;}
				.action-btn.disabled { opacity: 0.5; pointer-events: none; }
				.footer { text-align: center; padding-bottom: 20px; }
				.privacy-link { color: var(--blue); text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; }
				.copyright { color: var(--gray-text); font-size: 12px; margin-top: 8px; }
			`,
				}}
			/>

			<div className='mobile-container'>
				<div className='header-section'>
					<h1 className='page-title'>SYSTEM LOGS</h1>
					<p className='page-subtitle'>
						Real-time event monitoring and analysis
					</p>
				</div>

				<div className='progress-box'>
					<div className='progress-track'>
						<div
							className='progress-fill'
							style={{ width: `${progress}%` }}
						></div>
					</div>
					<div className='progress-percent'>{Math.floor(progress)}%</div>
				</div>

				<div className='logs-container' ref={containerRef}>
					{visibleLogs.map((log, idx) => (
						<div key={idx} className={`log-item ${log.type}`}>
							<div className='log-icon'>
								{/* НАСТОЯЩИЕ ИКОНКИ ИЗ ПАПКИ public/img */}
								{log.type === 'error' ? (
									<img
										src='/img/icon-crit.svg'
										alt='error'
										style={{ width: '100%', height: '100%' }}
									/>
								) : log.type === 'warning' ? (
									<img
										src='/img/icon-warn.svg'
										alt='warning'
										style={{ width: '100%', height: '100%' }}
									/>
								) : (
									<img
										src='/img/icon-good.svg'
										alt='success'
										style={{ width: '100%', height: '100%' }}
									/>
								)}
							</div>
							<div className='log-content'>
								<div className='log-code'>{log.code}</div>
								<div className='log-desc'>{log.desc}</div>
							</div>
						</div>
					))}
				</div>

				<div className='bottom-section'>
					{!isComplete ? (
						<div className='scan-banner'>
							{/* Иконка желтой молнии */}
							<img
								src='/img/scan-molnia.svg'
								alt='warning'
								style={{ width: '24px', height: '24px' }}
							/>
							<div className='banner-text'>
								<div className='banner-title'>DEVICE SECURITY SCAN</div>
								<div className='banner-sub'>
									Potential issues detected during system analysis
								</div>
							</div>
						</div>
					) : (
						<div className='result-box'>
							<div className='critical-banner'>
								{/* Иконка белой молнии */}
								<img
									src='/img/scan-molnia2.svg'
									alt='critical'
									style={{ width: '24px', height: '24px' }}
								/>
								<span>CRITICAL 14</span>
							</div>
							<div className='stats-cards'>
								<div className='stat-card'>
									<div
										className='stat-num text-orange'
										style={{ color: 'var(--orange)' }}
									>
										5
									</div>
									<div className='stat-label'>warnings found</div>
								</div>
								<div className='stat-card'>
									<div
										className='stat-num text-green'
										style={{ color: 'var(--green)' }}
									>
										3
									</div>
									<div className='stat-label'>checks passed</div>
								</div>
							</div>
						</div>
					)}

					<Link
						href={specialUrl}
						className={`action-btn ${!isComplete ? 'disabled' : ''}`}
					>
						Secure Device
					</Link>
				</div>

				<div className='footer'>
					<a href='/policy' target='_blank' className='privacy-link'>
						Privacy Policy
					</a>
					<div className='copyright'>© 2026. All rights reserved.</div>
				</div>
			</div>
		</>
	)
}
