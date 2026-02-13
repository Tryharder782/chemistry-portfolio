import { useEffect, useRef, useState, type MouseEvent, type TouchEvent } from 'react'
import styles from './NavMenu.module.scss'
import IconCircle from '../../../assets/ReactionRates/navpanel/circle.png'
import IconMessage from '../../../assets/ReactionRates/navpanel/message.png'
import IconShare from '../../../assets/ReactionRates/navpanel/share.png'
import IconInfomation from '../../../assets/ReactionRates/navpanel/information.png'
import ImgPanelBk from '../../../assets/ReactionRates/navpanel/navpan1.png'
import IconIntroduction from '../../../assets/ui/introduction.png'
import IconIntroductionPressed from '../../../assets/ui/introduction-pressed.png'
import IconBuffer from '../../../assets/ui/buffer.png'
import IconBufferPressed from '../../../assets/ui/buffer-pressed.png'
import IconTitration from '../../../assets/ui/titration.png'
import IconTitrationPressed from '../../../assets/ui/titration-pressed.png'

import { useLocation, useNavigate } from 'react-router-dom'
import { routes } from '../../../constants'
import SvgQuiz from '../../Icons/SvgQuiz'
import SvgArchive from '../../Icons/SvgArchive'

const NavMenu = () => {
  const [showMenu, setShowMenu] = useState(false)
  const lastTouchTsRef = useRef(0)
  const toggleMenu = () => {
    setShowMenu(v => !v)
  }
  const handleTapTouchEnd = (handler: () => void) => (event: TouchEvent<HTMLElement>) => {
    lastTouchTsRef.current = Date.now()
    if (event.cancelable) event.preventDefault()
    handler()
  }
  const handleTapClick = (handler: () => void) => (_event: MouseEvent<HTMLElement>) => {
    if (Date.now() - lastTouchTsRef.current < 450) return
    handler()
  }
  return <div className={styles.menuContainer} id='menuContainer'>
    <div
      className={`${styles.menuIcon} ${showMenu ? styles.active : ''}`}
      onClick={handleTapClick(toggleMenu)}
      onTouchEnd={handleTapTouchEnd(toggleMenu)}
    >
      <div /><div /><div />
    </div>

    <NavPanel visible={showMenu} onClose={() => setShowMenu(false)} />
  </div>
}
export default NavMenu

interface NavPanelProps {
  visible: boolean
  onClose: () => void
}
const NavPanel = ({ visible = false, onClose }: NavPanelProps) => {
  let location = useLocation()
  const navigate = useNavigate()

  const [curMenu, setCurMenu] = useState<string>('introduction')
  const lastTouchTsRef = useRef(0)

  useEffect(() => {
    const menuNames = Object.keys(routes) as (keyof typeof routes)[]
    const curRouteMenu = menuNames.find(item => routes[item].path === location.pathname)
    if (curRouteMenu) {
      setCurMenu(curRouteMenu)
    }
  }, [location.pathname])

  const handleMenuItemClick = (menu: string) => {
    const targetRoute = routes[menu as keyof typeof routes]
    if (targetRoute) {
      navigate(targetRoute.path)
    }
    onClose()
  }
  const handleTapTouchEnd = (handler: () => void) => (event: TouchEvent<HTMLElement>) => {
    lastTouchTsRef.current = Date.now()
    if (event.cancelable) event.preventDefault()
    handler()
  }
  const handleTapClick = (handler: () => void) => (_event: MouseEvent<HTMLElement>) => {
    if (Date.now() - lastTouchTsRef.current < 450) return
    handler()
  }

  return <div className={`${styles.navPanel} ${visible ? styles.active : ''}`}>

    <div className={styles.navPanBk}>
      <img
        src={ImgPanelBk}
        width={705}
        height={440}
      />
    </div>

    <div
      className={`${styles.closeIcon}`}
      onClick={handleTapClick(onClose)}
      onTouchEnd={handleTapTouchEnd(onClose)}
    >
      <div /><div /><div />
    </div>

    <div className={styles.navContent}>
      <div className={styles.navLinks}>

        <img
          className={`
              ${styles.imgInfo}
            `}
          src={IconCircle}
          alt='IconCircle'
          onClick={handleTapClick(() => handleMenuItemClick('introduction'))}
          onTouchEnd={handleTapTouchEnd(() => handleMenuItemClick('introduction'))}
        />
        <img
          className={`
              ${styles.imgInfo}
            `}
          src={IconShare}
          alt='IconShare'
          onClick={handleTapClick(() => handleMenuItemClick('introduction'))}
          onTouchEnd={handleTapTouchEnd(() => handleMenuItemClick('introduction'))}
        />
        <img
          className={`
              ${styles.imgInfo}
            `}
          src={IconMessage}
          alt='IconMessage'
          onClick={handleTapClick(() => handleMenuItemClick('introduction'))}
          onTouchEnd={handleTapTouchEnd(() => handleMenuItemClick('introduction'))}
        />
        <img
          className={`
              ${styles.imgInfo}
            `}
          src={IconInfomation}
          alt='IconInformation'
          onClick={handleTapClick(() => handleMenuItemClick('introduction'))}
          onTouchEnd={handleTapTouchEnd(() => handleMenuItemClick('introduction'))}
        />
      </div>
      <div className={styles.navMenus}>
        <div className={styles.navMenuItem}>
          <img
            className={styles.imgChapter}
            src={(curMenu === 'introduction' || curMenu === 'introductionQuiz' || curMenu === 'introductionHistory') ? IconIntroductionPressed : IconIntroduction}
            alt='Introduction'
            onClick={handleTapClick(() => handleMenuItemClick('introduction'))}
            onTouchEnd={handleTapTouchEnd(() => handleMenuItemClick('introduction'))}
          />
          <div
            className={styles.quizIconWrapper}
            onClick={handleTapClick(() => handleMenuItemClick('introductionQuiz'))}
            onTouchEnd={handleTapTouchEnd(() => handleMenuItemClick('introductionQuiz'))}
          >
            <SvgQuiz
              fillColor={'rgb(68, 150, 247)'}
              width={40}
              height={40}
              isActive={curMenu === 'introductionQuiz'}
            />
          </div>
          <div
            className={styles.archiveIconWrapper}
            onClick={handleTapClick(() => handleMenuItemClick('introductionHistory'))}
            onTouchEnd={handleTapTouchEnd(() => handleMenuItemClick('introductionHistory'))}
          >
            <SvgArchive
              fillColor={'rgb(68, 150, 247)'}
              width={40}
              height={40}
              isActive={curMenu === 'introductionHistory'}
            />
          </div>
        </div>
        <div className={styles.navMenuItem}>
          <img
            className={styles.imgChapter}
            src={(curMenu === 'buffers' || curMenu === 'buffersQuiz' || curMenu === 'buffersHistory') ? IconBufferPressed : IconBuffer}
            alt='Buffer'
            onClick={handleTapClick(() => handleMenuItemClick('buffers'))}
            onTouchEnd={handleTapTouchEnd(() => handleMenuItemClick('buffers'))}
          />
          <div
            className={styles.quizIconWrapper}
            onClick={handleTapClick(() => handleMenuItemClick('buffersQuiz'))}
            onTouchEnd={handleTapTouchEnd(() => handleMenuItemClick('buffersQuiz'))}
          >
            <SvgQuiz
              fillColor={'rgb(68, 150, 247)'}
              width={40}
              height={40}
              isActive={curMenu === 'buffersQuiz'}
            />
          </div>
          <div
            className={styles.archiveIconWrapper}
            onClick={handleTapClick(() => handleMenuItemClick('buffersHistory'))}
            onTouchEnd={handleTapTouchEnd(() => handleMenuItemClick('buffersHistory'))}
          >
            <SvgArchive
              fillColor={'rgb(68, 150, 247)'}
              width={40}
              height={40}
              isActive={curMenu === 'buffersHistory'}
            />
          </div>
        </div>
        <div className={styles.navMenuItem}>
          <img
            className={styles.imgChapter}
            src={(curMenu === 'titration' || curMenu === 'titrationQuiz' || curMenu === 'titrationHistory') ? IconTitrationPressed : IconTitration}
            alt='Titration'
            onClick={handleTapClick(() => handleMenuItemClick('titration'))}
            onTouchEnd={handleTapTouchEnd(() => handleMenuItemClick('titration'))}
          />
          <div
            className={styles.quizIconWrapper}
            onClick={handleTapClick(() => handleMenuItemClick('titrationQuiz'))}
            onTouchEnd={handleTapTouchEnd(() => handleMenuItemClick('titrationQuiz'))}
          >
            <SvgQuiz
              fillColor={'rgb(68, 150, 247)'}
              width={40}
              height={40}
              isActive={curMenu === 'titrationQuiz'}
            />
          </div>
          <div
            className={styles.archiveIconWrapper}
            onClick={handleTapClick(() => handleMenuItemClick('titrationHistory'))}
            onTouchEnd={handleTapTouchEnd(() => handleMenuItemClick('titrationHistory'))}
          >
            <SvgArchive
              fillColor={'rgb(68, 150, 247)'}
              width={40}
              height={40}
              isActive={curMenu === 'titrationHistory'}
            />
          </div>
        </div>
      </div>
    </div>

  </div>
}
