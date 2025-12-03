<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class PatientStatusTest extends TestCase
{
    /**
     * Test patient is improving with high HbA1c drop
     */
    public function test_patient_is_improving_with_high_hba1c_drop(): void
    {
        $status = $this->getPatientStatus(1.5, 0, 0);
        $this->assertEquals('Improving', $status);
    }

    /**
     * Test patient is improving with low FVG delta
     */
    public function test_patient_is_improving_with_low_fvg_delta(): void
    {
        $status = $this->getPatientStatus(0, -1.5, 0);
        $this->assertEquals('Improving', $status);
    }

    /**
     * Test patient is worsening with negative HbA1c drop
     */
    public function test_patient_is_worsening_with_negative_hba1c_drop(): void
    {
        $status = $this->getPatientStatus(-1.0, 0, 0);
        $this->assertEquals('Worsening', $status);
    }

    /**
     * Test patient is worsening with high FVG delta
     */
    public function test_patient_is_worsening_with_high_fvg_delta(): void
    {
        $status = $this->getPatientStatus(0.5, 1.5, 0);
        $this->assertEquals('Worsening', $status);
    }

    /**
     * Test patient needs review with high DDS trend
     */
    public function test_patient_needs_review_with_high_dds_trend(): void
    {
        $status = $this->getPatientStatus(0.5, 0, 1.5);
        $this->assertEquals('Needs Review', $status);
    }

    /**
     * Test patient is stable with moderate values
     */
    public function test_patient_is_stable_with_moderate_values(): void
    {
        $status = $this->getPatientStatus(0.5, 0.3, 0.5);
        $this->assertEquals('Stable', $status);
    }

    /**
     * Test patient is stable when HbA1c drop is exactly 1.0
     */
    public function test_patient_is_stable_at_boundary_hba1c(): void
    {
        $status = $this->getPatientStatus(1.0, 0, 0);
        $this->assertEquals('Stable', $status);
    }

    /**
     * Test patient is stable when HbA1c drop is exactly 0
     */
    public function test_patient_is_stable_at_zero_hba1c(): void
    {
        $status = $this->getPatientStatus(0, 0, 0);
        $this->assertEquals('Stable', $status);
    }

    /**
     * Test handles null values gracefully
     */
    public function test_handles_null_values(): void
    {
        $status = $this->getPatientStatus(null, null, null);
        $this->assertEquals('Stable', $status);
    }

    /**
     * Helper method to determine patient status
     * Mirrors the frontend logic for consistency
     */
    private function getPatientStatus($hbDrop, $fvgDelta, $ddsTrend): string
    {
        if ($hbDrop !== null) {
            if ($hbDrop > 1.0) return 'Improving';
            if ($hbDrop < 0) return 'Worsening';
        }
        if ($fvgDelta !== null) {
            if ($fvgDelta < -1.0) return 'Improving';
            if ($fvgDelta > 1.0) return 'Worsening';
        }
        if ($ddsTrend !== null && $ddsTrend > 1) {
            return 'Needs Review';
        }
        return 'Stable';
    }
}
