import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DecodeButton } from '@/components/translator/DecodeButton';

describe('DecodeButton', () => {
  it('idle 态可点击', () => {
    const onClick = vi.fn();
    render(<DecodeButton onClick={onClick} status="idle" />);
    const btn = screen.getByRole('button', { name: /解码/ });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('analyzing 态 disabled', () => {
    render(<DecodeButton onClick={vi.fn()} status="analyzing" />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('analyzing 态展示加载中文案', () => {
    render(<DecodeButton onClick={vi.fn()} status="analyzing" />);
    expect(screen.getByText(/解码中/)).toBeInTheDocument();
  });

  it('result 态可点击', () => {
    const onClick = vi.fn();
    render(<DecodeButton onClick={onClick} status="result" />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('error 态可点击', () => {
    const onClick = vi.fn();
    render(<DecodeButton onClick={onClick} status="error" />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });
});
