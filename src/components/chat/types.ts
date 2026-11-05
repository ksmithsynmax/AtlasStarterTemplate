export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  /**
   * Plain text. Blank lines split paragraphs, lines starting with "- " become
   * bullets and **double asterisks** mark bold.
   */
  text: string;
  /** Display time, e.g. "08:58 PM". */
  time: string;
}
