import type { Translations } from './types';

/**
 * Typed as `Translations` (derived from zh-CN) so the two bundles cannot drift:
 * a key missing here, or one added here and not there, fails `tsc`.
 */
const en: Translations = {
    // General — reused across nearly every page.
    common: {
        search: 'Search',
        filter: 'Filter',
        all: 'All',
        description: 'Description',
        actions: 'Actions',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        update: 'Update',
        confirm: 'Confirm',
        cancel: 'Cancel',
        submit: 'Submit',
        close: 'Close',
        loading: 'Loading',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Info',
        status: 'Status',
        view: 'View',
        back: 'Back',
        unknown: 'Unknown',
    },

    // Shared status labels. Kept top-level so every module reads the same
    // text instead of duplicating a per-page status map.
    status: {
        pending: 'Pending',
        processing: 'Processing',
        completed: 'Completed',
        cancelled: 'Cancelled',
        failed: 'Failed',
        unknown: 'Unknown status',
    },

    // Dashboard
    dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome',
        total_users: 'Total Users',
        today_added: 'Today Added',
        today_deducted: 'Today Deducted',
        today_transactions: 'Today Transactions',
        top_10_users: 'Top 10 Users by Points',
        your_points: 'My Points',
        total_points: 'Total Points',
        redeemable_points: 'Redeemable Points',
        recent_transactions: 'Recent Transactions',
    },

    // Points
    points: {
        title: 'Points',
        my_points: 'My Points',
        history: 'Point History',
        recent_transactions: 'Recent Transactions',
        view_all: 'View All',
        back_to_points: 'Back to Points',
        no_transactions: 'No transactions yet',
        transaction_history: 'Transaction History',
        filter_transactions: 'Filter Transactions',
        search_by_source: 'Search by source',
        all_types: 'All types',
        type_total: 'Total Points',
        type_redeemable: 'Redeemable Points',
        no_transactions_found: 'No transactions found',
        cumulative_lifetime_points: 'Cumulative lifetime points',
        available_for_exchange: 'Available for exchange',
    },

    // Shop
    shop: {
        title: 'Shop',
        my_orders: 'My Orders',
        back_to_shop: 'Back to Shop',
        search_products: 'Search Products',
        all_categories: 'All categories',
        product_catalog: 'Product Catalog',
        exchange_redeemable_points:
            'Exchange your redeemable points for rewards',
        out_of_stock: 'Out of Stock',
        in_stock: 'In Stock',
        only_x_left: 'Only {{count}} left',
        third_party: 'Third Party',
        unavailable: 'Unavailable',
        exchange_now: 'Exchange Now',
        order_details: 'Order Details',
        product_information: 'Product Information',
        shipping_information: 'Shipping Information',
        recipient_name: 'Recipient Name',
        phone_number: 'Phone Number',
        delivery_address: 'Delivery Address',
        enter_recipient_name: 'Enter recipient name',
        enter_phone_number: 'Enter phone number',
        enter_complete_address: 'Enter complete delivery address',
        confirm_exchange: 'Confirm Exchange',
        order_number: 'Order Number',
        order_date: 'Order Date',
        last_updated: 'Last Updated',
        points_spent: 'Points Spent',
        external_order_id: 'External Order ID',
        order_timeline: 'Order Timeline',
        order_summary: 'Order Summary',
        third_party_order: 'Third Party Order',
        exchange_successful: 'Exchange successful',
        exchange_failed: 'Exchange failed',
    },

    // Errors
    errors: {
        insufficient_points: 'Insufficient points',
        product_out_of_stock: 'Product out of stock',
        try_adjusting_filters: 'Try adjusting your search or filters',
        no_products_found: 'No products found',
        no_orders_found: 'No orders found',
    },
};

export default en;
