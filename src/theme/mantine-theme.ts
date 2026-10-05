'use client';
import { createTheme } from '@mantine/core';

export const mantineTheme = createTheme({
  primaryColor: 'brand',
  primaryShade: 7,
  defaultRadius: 'md',
  defaultGradient: {
    from: 'brand.7',
    to: 'brand.6',
    deg: 135,
  },
  fontFamily: 'var(--font-inter), Inter, sans-serif',
  headings: {
    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
    fontWeight: '700',
  },
  black: '#191c1d',
  white: '#ffffff',
  colors: {
    brand: ['#fff1ef', '#ffe4e0', '#ffd0ca', '#ffbdb4', '#fe978c', '#ee746a', '#d95349', '#b02521', '#91090e', '#680006'],
    archive: ['#f8f9fa', '#f3f4f5', '#edeeef', '#e7e8e9', '#e1e3e4', '#d9dadb', '#c6c8c9', '#a8abad', '#7e8183', '#5a5d5f'],
    ink: ['#f5f1f0', '#eadfdd', '#dcc8c4', '#cbb0aa', '#b4968f', '#9c7b74', '#835f59', '#6c4843', '#5a413e', '#3b2a28'],
    jade: ['#e6fffb', '#c8f7f2', '#a7eee7', '#81f6ea', '#63d9ce', '#33b9ad', '#00837a', '#006861', '#00504a', '#003833'],
    danger: ['#fff1f0', '#ffddda', '#ffcac5', '#ffb4ab', '#ff8a80', '#ef5f5a', '#dc3535', '#ba1a1a', '#93000a', '#690005'],
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
        autoContrast: true,
      },
      styles: (_: unknown, props: { variant?: string }) => ({
        root: {
          border: 'none',
          fontWeight: 600,
          transition: 'transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease, color 160ms ease',
          ...(props.variant === 'filled' && {
            backgroundImage: 'linear-gradient(135deg, #b02521 0%, #d33f36 100%)',
            boxShadow: '0 12px 32px -4px rgba(25, 28, 29, 0.06)',
          }),
          ...(props.variant === 'default' && {
            backgroundColor: '#e1e3e4',
            color: '#191c1d',
          }),
          ...(props.variant === 'light' && {
            backgroundColor: 'rgba(176, 37, 33, 0.10)',
            color: '#b02521',
          }),
          ...(props.variant === 'subtle' && {
            color: '#b02521',
          }),
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      }),
    },
    ActionIcon: {
      defaultProps: {
        radius: 'xl',
        color: 'brand',
        variant: 'subtle',
      },
      styles: () => ({
        root: {
          color: '#b02521',
          '&:hover': {
            backgroundColor: 'rgba(176, 37, 33, 0.08)',
          },
        },
      }),
    },
    Input: {
      styles: () => ({
        input: {
          backgroundColor: '#f3f4f5',
          borderColor: 'rgba(226, 190, 186, 0.2)',
          color: '#191c1d',
          '&:focus, &:focus-within': {
            backgroundColor: '#ffffff',
            borderColor: 'rgba(176, 37, 33, 0.35)',
          },
        },
      }),
    },
    Paper: {
      styles: () => ({
        root: {
          backgroundColor: '#ffffff',
          boxShadow: '0 12px 32px -4px rgba(25, 28, 29, 0.06)',
        },
      }),
    },
    Modal: {
      defaultProps: {
        radius: 'xl',
      },
      styles: () => ({
        content: {
          backgroundColor: '#ffffff',
          boxShadow: '0 12px 32px -4px rgba(25, 28, 29, 0.06)',
        },
        header: {
          backgroundColor: '#ffffff',
        },
        title: {
          color: '#191c1d',
          fontFamily: 'var(--font-manrope), Manrope, sans-serif',
          fontWeight: 700,
        },
      }),
    },
  },
});