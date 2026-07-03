import { university } from '../data/mock.js'

/**
 * Oliver University 校徽（使用设计好的纹章图片 public/crest.png）
 *
 * props:
 *   size   —— 像素尺寸（正方形），默认 48
 *   tone   —— 'light'（默认，用于浅色背景，直接显示）
 *             'onDark'（用于深色背景，套一个砂岩圆底做成"徽章/印章"效果，避免浅色底突兀）
 *   className —— 额外样式
 */
export default function Crest({ size = 48, tone = 'light', className = '' }) {
  const img = (
    <img
      src="/crest.png"
      alt={`${university.name} crest`}
      width={size}
      height={size}
      className="object-contain"
      style={{ width: size, height: size }}
    />
  )

  if (tone === 'onDark') {
    const pad = Math.round(size * 0.14)
    return (
      <span
        className={`inline-grid place-items-center rounded-full bg-sand shrink-0 ${className}`}
        style={{ padding: pad }}
      >
        {img}
      </span>
    )
  }

  return <span className={`inline-grid place-items-center shrink-0 ${className}`}>{img}</span>
}
