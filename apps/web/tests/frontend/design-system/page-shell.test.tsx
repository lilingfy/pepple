import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CenteredStageLayout, PageShell, SidebarLayout } from '@/components/layout/PageShell';
import { MainHeader } from '@/components/layout/MainHeader';

describe('MainHeader', () => {
  it('renders a navigation landmark with the active item marked', () => {
    render(
      <MainHeader
        items={[
          { label: '首页', href: '/' },
          { label: '翻译器', href: '/translator' },
        ]}
        activeHref="/translator"
      />
    );

    expect(screen.getByRole('navigation', { name: '主导航' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '首页' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '翻译器' })).toHaveAttribute('aria-current', 'page');
  });
});

describe('PageShell', () => {
  it('renders header, main content, and footer regions', () => {
    render(
      <PageShell
        header={<div>页头</div>}
        footer={<div>页脚</div>}
      >
        <div>内容</div>
      </PageShell>
    );

    expect(screen.getByText('页头')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('内容');
    expect(screen.getByText('页脚')).toBeInTheDocument();
  });
});

describe('SidebarLayout', () => {
  it('exposes left, center, and right slots for multi-column pages', () => {
    const { container } = render(
      <SidebarLayout
        left={<div>左侧</div>}
        center={<div>中间</div>}
        right={<div>右侧</div>}
      />
    );

    expect(screen.getByText('左侧')).toBeInTheDocument();
    expect(screen.getByText('中间')).toBeInTheDocument();
    expect(screen.getByText('右侧')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('lg:grid-cols-[280px_minmax(0,1fr)_320px]');
  });
});

describe('CenteredStageLayout', () => {
  it('renders a centered stage for focused experiences', () => {
    const { container } = render(
      <CenteredStageLayout title="急救呼吸" description="请跟随节奏">
        <div>舞台内容</div>
      </CenteredStageLayout>
    );

    expect(screen.getByRole('heading', { name: '急救呼吸' })).toBeInTheDocument();
    expect(screen.getByText('请跟随节奏')).toBeInTheDocument();
    expect(screen.getByText('舞台内容')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('min-h-[70vh]');
  });
});
