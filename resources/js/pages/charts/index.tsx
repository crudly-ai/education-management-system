import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { createBreadcrumbs } from '@/layouts/app/breadcrumbs';
import { Head } from '@inertiajs/react';
import { useTranslations } from '@/hooks/use-translations';
import { BarChartDemo } from '@/components/charts/bar-chart';
import { LineChartMultiple } from '@/components/charts/line-chart';
import { PieChartDemo } from '@/components/charts/pie-chart';
import { AreaChartStacked } from '@/components/charts/area-chart';
import { BarChartMultiple } from '@/components/charts/bar-chart-multiple';
import { RadialChartLabel } from '@/components/charts/radial-chart';
import { BarChartHorizontal } from '@/components/charts/bar-chart-horizontal';
import { BarChartActive } from '@/components/charts/bar-chart-active';
import { PieChartInteractive } from '@/components/charts/pie-chart-interactive';
import { PieChartDonutText } from '@/components/charts/pie-chart-donut-text';
import { PieChartLabelList } from '@/components/charts/pie-chart-label-list';
import { RadialChartText } from '@/components/charts/radial-chart-text';

export default function ChartsIndex() {
    const { t } = useTranslations();
    const breadcrumbs = createBreadcrumbs('charts');

    return (
        <AuthenticatedLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Charts')} />
            
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">{t('Charts')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('Interactive data visualization components')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <BarChartDemo />
                    <BarChartMultiple />
                    <BarChartHorizontal />
                    <BarChartActive />
                    <LineChartMultiple />
                    <AreaChartStacked />
                    <PieChartDemo />
                    <PieChartInteractive />
                    <PieChartDonutText />
                    <PieChartLabelList />
                    <RadialChartLabel />
                    <RadialChartText />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}