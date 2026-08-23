import React from 'react';
import { Clock, CheckCircle2, PackageCheck, Flame, Bike, AlertCircle, MapPin } from 'lucide-react';
import type { Order, OrderStatus } from '../types';

interface OrdersViewProps {
  orders: Order[];
  t: any;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, t }) => {
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

  const statusLabel = (status: OrderStatus) => {
    const map: Record<OrderStatus, string> = {
      Pending: 'قيد الانتظار',
      Confirmed: 'تم التأكيد',
      Preparing: 'جاري التحضير',
      Ready: 'جاهز للتسليم',
      Delivered: 'تم التوصيل',
      Cancelled: 'ملغي',
    };
    return map[status] || status;
  };

  return (
    <section>
      <div className="section-header">
        <div>
          <h2 className="section-title">{t.ordersTitle}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {t.ordersSub}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Clock size={48} style={{ margin: '0 auto 15px auto', opacity: 0.4 }} />
          <h3>{t.noOrders}</h3>
          <p>{t.emptyCartSub}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div key={order.id} className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.orderId}</span>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>#{order.id.slice(0, 8)}</div>
                  {order.delivery_address && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <MapPin size={14} style={{ color: 'var(--primary)' }} />
                      <span>{order.delivery_address}</span>
                    </div>
                  )}
                  {order.notes && (
                    <div style={{ fontSize: '0.82rem', color: '#eab308', marginTop: '2px' }}>
                      📝 {order.notes}
                    </div>
                  )}
                </div>

                <div className={`status-badge status-${order.status}`}>
                  {getStatusIcon(order.status)}
                  {statusLabel(order.status)}
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
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px' }}>الأصناف المطلوبة:</h4>
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
                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{t.totalPrice}</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>{order.total_price} ₺</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
