import React from 'react';
import { Clock, CheckCircle2, PackageCheck, Flame, Bike, AlertCircle } from 'lucide-react';
import type { Order, OrderStatus } from '../types';

interface OrdersViewProps {
  orders: Order[];
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders }) => {
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return <Clock size={16} />;
      case 'Confirmed':
        return <CheckCircle2 size={16} />;
      case 'Preparing':
        return <Flame size={16} />;
      case 'Ready':
        return <PackageCheck size={16} />;
      case 'Delivered':
        return <Bike size={16} />;
      case 'Cancelled':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <section>
      <div className="section-header">
        <div>
          <h2 className="section-title">My Orders</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Track your live order status and view past dining history
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Clock size={48} style={{ margin: '0 auto 15px auto', opacity: 0.4 }} />
          <h3>No orders placed yet</h3>
          <p>Order your favorite meals from our menu!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div key={order.id} className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Order ID</span>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>#{order.id.slice(0, 8)}</div>
                </div>

                <div className={`status-badge status-${order.status}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
              </div>

              {/* Status Tracker Bar */}
              <div style={{ display: 'flex', gap: '5px', margin: '20px 0', background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ flex: 1, background: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered'].includes(order.status) ? 'var(--primary)' : '#334155' }} />
                <div style={{ flex: 1, background: ['Confirmed', 'Preparing', 'Ready', 'Delivered'].includes(order.status) ? 'var(--accent-cyan)' : '#334155' }} />
                <div style={{ flex: 1, background: ['Preparing', 'Ready', 'Delivered'].includes(order.status) ? '#f97316' : '#334155' }} />
                <div style={{ flex: 1, background: ['Ready', 'Delivered'].includes(order.status) ? '#a855f7' : '#334155' }} />
                <div style={{ flex: 1, background: order.status === 'Delivered' ? 'var(--accent-green)' : '#334155' }} />
              </div>

              <div style={{ marginTop: '15px', borderTop: '1px solid var(--border-light)', paddingTop: '15px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Ordered Items:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                      <span>
                        <strong style={{ color: 'var(--primary)' }}>{item.quantity}x</strong> {item.product?.name || 'Dish Item'}
                      </span>
                      <span style={{ fontWeight: 600 }}>{item.price} ₺</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', paddingTop: '15px', borderTop: '1px dashed var(--border-light)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Total Price</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>{order.total_price} ₺</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
