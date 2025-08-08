"use client";

import React, { memo } from 'react';
import type { WireframeNode, WireframeScreen } from './types';

const padClass = (p?: 'none' | 'sm' | 'md' | 'lg') => {
  switch (p) {
    case 'none': return 'p-0';
    case 'sm': return 'p-2';
    case 'md': return 'p-4';
    case 'lg': return 'p-6';
    default: return 'p-4';
  }
};

function renderNode(node: WireframeNode, path: string = 'root'): React.ReactNode {
  const key = path;
  const props: any = (node as any).props || {};

  switch (node.type) {
    case 'Screen': {
      const screen = node as WireframeScreen;
      return (
        <div key={key} className={`w-full ${padClass(screen.props?.padding)} space-y-3`}>
          {screen.props?.title ? (
            <div className="text-lg font-semibold text-gray-900">{screen.props.title}</div>
          ) : null}
          {screen.children?.map((c, i) => renderNode(c, `${path}.${i}`))}
        </div>
      );
    }
    case 'Header': {
      return (
        <div key={key} className="flex items-center justify-between py-2">
          <div className="text-base font-semibold text-gray-900">{props.title || 'Header'}</div>
          {props.action ? (
            <button className="text-sm text-blue-600 hover:underline">{props.action}</button>
          ) : null}
        </div>
      );
    }
    case 'Text': {
      const size = props.size === 'sm' ? 'text-sm' : props.size === 'lg' ? 'text-lg' : 'text-sm';
      const color = props.muted ? 'text-gray-500' : 'text-gray-800';
      return (
        <p key={key} className={`${size} ${color}`}>{props.value || ''}</p>
      );
    }
    case 'Button': {
      const variant = props.variant === 'primary' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800';
      return (
        <button key={key} className={`w-full rounded-md px-4 py-2 text-sm ${variant}`}>{props.label || 'Button'}</button>
      );
    }
    case 'List': {
      const items: any[] = Array.isArray(props.items) ? props.items : [];
      return (
        <div key={key} className="divide-y divide-gray-200 rounded-md border border-gray-200">
          {items.map((it, i) => (
            <div key={i} className="p-3">
              <div className="text-sm font-medium text-gray-900">{it.title || `Item ${i+1}`}</div>
              {it.subtitle ? <div className="text-xs text-gray-500">{it.subtitle}</div> : null}
            </div>
          ))}
        </div>
      );
    }
    case 'Card': {
      return (
        <div key={key} className="rounded-lg border border-gray-200 p-4 shadow-sm">
          {props.title ? <div className="text-sm font-semibold text-gray-900 mb-1">{props.title}</div> : null}
          {props.content ? <div className="text-sm text-gray-700">{props.content}</div> : null}
          {Array.isArray(node.children) ? node.children.map((c, i) => renderNode(c, `${path}.${i}`)) : null}
        </div>
      );
    }
    case 'Form': {
      const fields: any[] = Array.isArray(props.fields) ? props.fields : [];
      return (
        <form key={key} className="space-y-3">
          {fields.map((f, i) => (
            <div key={i} className="space-y-1">
              {f.label ? <label className="text-xs text-gray-600">{f.label}</label> : null}
              <input
                type={f.type === 'PasswordField' ? 'password' : 'text'}
                name={f.name || `field_${i}`}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={f.placeholder || ''}
                readOnly
              />
            </div>
          ))}
          {props.submitLabel ? (
            <button type="button" className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm text-white">{props.submitLabel}</button>
          ) : null}
        </form>
      );
    }
    default: {
      const typeName = (node as any)?.type;
      return (
        <div key={key} className="rounded-md border border-dashed border-gray-300 p-3 text-xs text-gray-500">
          Unknown node: {String(typeName)}
        </div>
      );
    }
  }
}

const UIWireframeRenderer = memo(function UIWireframeRenderer({ screen }: { screen: WireframeScreen }) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200">
      {renderNode(screen, 'root')}
    </div>
  );
});

export default UIWireframeRenderer;
