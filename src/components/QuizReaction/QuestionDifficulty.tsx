import styles from './styles.module.scss'
import { runTapClick, runTapTouch } from '../AcidsBases/hooks/tapUtils'

// Quiz selection in first step
interface QuestionDifficultyProps {
  text: string
  count: number
  isActive?: boolean
  onClick: (val: number) => void
}
const QuestionDifficulty = ({
  text,
  count,
  isActive,
  onClick,
}: QuestionDifficultyProps) => {
  return <div
    className={`${styles.diffCard} ${isActive ? styles.active : ''}`}
    onClick={(event) => runTapClick(event, () => onClick(count))}
    onTouchEnd={(event) => runTapTouch(event, () => onClick(count))}
  >
    <h1>{text}</h1>
    <span className={styles.diffCardQuizCount}>{`${count} questions`}</span>
  </div>
}

export default QuestionDifficulty
