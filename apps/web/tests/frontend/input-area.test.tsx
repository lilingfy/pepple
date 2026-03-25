import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InputArea } from '@/components/translator/InputArea';

describe('InputArea', () => {
  it('渲染多行文本输入框', () => {
    render(<InputArea value="" onChange={vi.fn()} onSubmit={vi.fn()} status="idle" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('显示实时字符计数', () => {
    render(<InputArea value="你好世界" onChange={vi.fn()} onSubmit={vi.fn()} status="idle" />);
    expect(screen.getByText(/4/)).toBeInTheDocument();
  });

  it('超过 500 字符时显示警告', () => {
    const longText = 'a'.repeat(501);
    render(<InputArea value={longText} onChange={vi.fn()} onSubmit={vi.fn()} status="idle" />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('analyzing 态禁用输入框', () => {
    render(<InputArea value="文本" onChange={vi.fn()} onSubmit={vi.fn()} status="analyzing" />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('idle 态输入框可用', () => {
    render(<InputArea value="" onChange={vi.fn()} onSubmit={vi.fn()} status="idle" />);
    expect(screen.getByRole('textbox')).not.toBeDisabled();
  });

  it('工具栏包含语音输入按钮（disabled）', () => {
    render(<InputArea value="" onChange={vi.fn()} onSubmit={vi.fn()} status="idle" />);
    const voiceBtn = screen.getByRole('button', { name: /语音/ });
    expect(voiceBtn).toBeDisabled();
  });

  it('工具栏包含附件按钮（disabled）', () => {
    render(<InputArea value="" onChange={vi.fn()} onSubmit={vi.fn()} status="idle" />);
    const attachBtn = screen.getByRole('button', { name: /附件/ });
    expect(attachBtn).toBeDisabled();
  });

  it('onChange 在用户输入时被调用', () => {
    const onChange = vi.fn();
    render(<InputArea value="" onChange={onChange} onSubmit={vi.fn()} status="idle" />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '新文本' } });
    expect(onChange).toHaveBeenCalledWith('新文本');
  });
});
